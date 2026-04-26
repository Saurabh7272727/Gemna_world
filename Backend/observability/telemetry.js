import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import {
    SEMRESATTRS_DEPLOYMENT_ENVIRONMENT,
    SEMRESATTRS_SERVICE_NAME,
    SEMRESATTRS_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';
import { env } from '../config/env.js';
import { logger } from './logger.js';

let sdk;
let started = false;

const normalizeHeaders = (rawHeaders) => {
    if (!rawHeaders) {
        return {};
    }

    return rawHeaders
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean)
        .reduce((headers, entry) => {
            const [key, ...rest] = entry.split('=');
            if (!key || rest.length === 0) {
                return headers;
            }

            headers[key.trim()] = rest.join('=').trim();
            return headers;
        }, {});
};

const buildOtlpUrl = (pathName) => `${env.telemetry.endpointBase}${pathName.startsWith('/') ? pathName : `/${pathName}`}`;

export const startTelemetry = async () => {
    if (started || !env.telemetry.enabled) {
        if (!env.telemetry.enabled) {
            logger.info('OpenTelemetry is disabled by configuration');
        }
        return;
    }

    if (env.isDevelopment) {
        diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ERROR);
    }

    const headers = normalizeHeaders(env.telemetry.headers);
    const resource = resourceFromAttributes({
        [SEMRESATTRS_SERVICE_NAME]: env.serviceName,
        [SEMRESATTRS_SERVICE_VERSION]: env.serviceVersion,
        [SEMRESATTRS_DEPLOYMENT_ENVIRONMENT]: env.environment,
    });

    sdk = new NodeSDK({
        resource,
        traceExporter: env.telemetry.tracesEnabled
            ? new OTLPTraceExporter({
                url: "https://ingest.us2.signoz.cloud/v1/traces",
                headers: {
                    "signoz-ingestion-key": "1Wi6nB4GGKWN7uiBKXHMTdVkHHiBKiK9gPvB"
                }
            })
            : undefined,
        metricReader: env.telemetry.metricsEnabled
            ? new PeriodicExportingMetricReader({
                exporter: new OTLPMetricExporter({
                    url: "https://ingest.us2.signoz.cloud/v1/metrics",
                    headers: {
                        "signoz-ingestion-key": "1Wi6nB4GGKWN7uiBKXHMTdVkHHiBKiK9gPvB"
                    }
                }),
                exportIntervalMillis: env.telemetry.exportIntervalMs,
            })
            : undefined,
        instrumentations: [
            getNodeAutoInstrumentations({
                '@opentelemetry/instrumentation-fs': {
                    enabled: false,
                },
            }),
        ],
    });

    sdk.start();
    started = true;
    logger.info('OpenTelemetry started', {
        otlpEndpoint: env.telemetry.endpointBase,
        tracesEnabled: env.telemetry.tracesEnabled,
        metricsEnabled: env.telemetry.metricsEnabled,
    });
};

export const shutdownTelemetry = async () => {
    if (!sdk || !started) {
        return;
    }

    await sdk.shutdown();
    started = false;
    logger.info('OpenTelemetry shutdown completed');
};
