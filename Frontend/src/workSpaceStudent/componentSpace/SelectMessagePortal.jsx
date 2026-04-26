import React from 'react'
import { createPortal } from 'react-dom';
import { Trash2, Pencil, ArrowRightToLine } from 'lucide-react';


const SelectMessagePortal = ({ safeMessages, timeGetter, WeekDay, isCurrentUser, senderImageUrl, receiverImageUrl }) => {

    // console.log("Message_Data ===============>", safeMessages, isCurrentUser);

    const policyListOnPage = [
        {
            name: "Delete",
            icon: Trash2,
            onlySender: true,
            path: "/delete/single/message",
            ring: "red",
            disabled: false
        },
        {
            name: "Edit",
            icon: Pencil,
            limithours: 2,
            path: "/edit/message",
            ring: "blue",
            disabled: false

        },
        {
            name: "Forward",
            icon: ArrowRightToLine,
            onlySender: false,
            path: "/forward/single/message",
            ring: 'green',
            disabled: true

        }
    ]

    return createPortal(
        <>
            <div
                className="top-[58%] 
                md:top-0 h-[40%] md:h-full
                cursor-not-allowed absolute
                inset-0 z-[9999] flex items-center
                justify-center bg-transparent px-3 md:px-6">
                <div className='md:w-[40%] md:h-[40%] cursor-default w-full h-full'>
                    <div className="flex w-full max-w-full h-full bg-gray-950 text-white rounded-md shadow-lg overflow-hidden">

                        {
                            isCurrentUser ?
                                <div className="w-1/3 h-full min-h-1 bg-gray-900 flex flex-col items-center justify-center p-6 relative">

                                    <div className="flex flex-col items-center">
                                        <img
                                            src={senderImageUrl}
                                            alt="S"
                                            className="w-12 h-[80%] rounded-full object-cover border-2 border-gray-700"
                                        />
                                        <span className="text-xs text-gray-400 mt-2">Sender</span>
                                    </div>

                                    <div className="flex flex-col items-center my-6">
                                        <div className="w-[4px] h-3 bg-gradient-to-b from-gray-700 to-transparent"></div>
                                        <div className="text-gray-500 text-xl animate-bounce">↓</div>
                                        <div className="w-[4px] h-3 bg-gradient-to-t from-gray-700 to-transparent"></div>
                                    </div>

                                    <div className="flex flex-col items-center">
                                        <img
                                            src={receiverImageUrl}
                                            alt="R"
                                            className="w-12 h-[80%] rounded-full object-cover border-2 border-gray-700"
                                        />
                                        <span className="text-xs text-gray-400 mt-2">Receiver</span>
                                    </div>

                                </div>
                                :
                                <div className="w-1/3 h-full min-h-1 bg-gray-900 flex flex-col items-center justify-center p-6 relative">

                                    <div className="flex flex-col items-center">
                                        <img
                                            src={receiverImageUrl}
                                            alt="S"
                                            className="w-12 h-[80%] rounded-full object-cover border-2 border-gray-700"
                                        />
                                        <span className="text-xs text-gray-400 mt-2">Sender</span>
                                    </div>

                                    <div className="flex flex-col items-center my-6">
                                        <div className="w-[4px] h-2 bg-gradient-to-b from-gray-700 to-transparent"></div>
                                        <div className="text-gray-500 text-xl animate-bounce">↓</div>
                                        <div className="w-[4px] h-2 bg-gradient-to-t from-gray-700 to-transparent"></div>
                                    </div>

                                    <div className="flex flex-col items-center">
                                        <img
                                            src={senderImageUrl}
                                            alt="R"
                                            className="w-12 h-[80%] rounded-full object-cover border-2 border-gray-700"
                                        />
                                        <span className="text-xs text-gray-400 mt-2">Receiver</span>
                                    </div>

                                </div>
                        }


                        <div className="w-2/3 h-full flex flex-col p-5 min-h-0">

                            <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-none md:pb-0 pb-4">

                                <div className="bg-gray-800 p-4 rounded-xl text-sm leading-relaxed shadow-inner break-words">
                                    {safeMessages.message ?? "N/A"}
                                </div>

                                <div className='w-[50%] h-auto flex justify-centers gap-x-2 items-center flex-wrap ml-2 gap-y-2'>
                                    {
                                        policyListOnPage.map((item) => {
                                            const Icon = item?.icon;
                                            if (!item.ring) alert("ring are required");
                                            return (
                                                <button className={`ring-2 ring-${item?.ring}-600 
                                                rounded-md px-4 py-2 bg-${item.ring}-500 font-medium flex justify-center items-center gap-x-2  text-[14px]`}>{item.name}  <Icon size={14}
                                                        onClick={(e) => e.stopPropagation()}
                                                        disabled={item.disabled}
                                                    /></button>
                                            )
                                        })
                                    }
                                </div>
                            </div>

                            <div className="mt-4 flex justify-between text-xs text-gray-400 border-t border-gray-900 pt-3">
                                <span>{safeMessages?.type ?? "N/A"}</span>
                                <span>{new Date(safeMessages?.createdAt).toLocaleString()}</span>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </>
        , document.body)
}

export default SelectMessagePortal;