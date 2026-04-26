import React, { useEffect, useRef, useState } from 'react'
import Error404 from '../../../Components/ErrorPages/Error404.jsx';
import {
    FaSearch
} from 'react-icons/fa';
import { GoVerified } from "react-icons/go";
import { useSelector, useDispatch } from 'react-redux';
import { SiGooglegemini } from "react-icons/si";
import MobileActionList from './component_apps/GChatTools.jsx';
import ShowConnectedFri from './component_apps/ShowConnectedFri.jsx';
import ApiEndPoints from '../../../ReduxStore/apiEndPoints/apiEndPoints.js';
import {
    addActiveUserList, addConnectionList, setfirstMessagerSet
    , removeDuplicateValue
} from '../../../ReduxStore/Slices/ListSliceOfStudents.js';
import { useNavigate } from 'react-router-dom';
import ChatArea from './component_apps/ChatArea.jsx'
import { PulseLoadingSpinner } from '../../../Components/LodingSpinners/LoadingDemo.jsx'
import { AiFillFire } from 'react-icons/ai';
import socket from '../../../socket_client/socket_client.js';

const G_chatApp = ({ renderPart }) => {
    const dispatch = useDispatch();
    const navi = useNavigate();
    const ActiveUserList = useSelector(state => state?.ListSliceOdfStudent?.ActiveUserList);
    const OnlineUserList = useSelector(state => state?.ListSliceOdfStudent?.OnlineUserList);
    const ConnectedUserList = useSelector(state => state?.ListSliceOdfStudent?.ConnectedUserList);
    const studentProfile = useSelector((state) => state?.userinfoSlice?.user)

    const [loading, setLoading] = useState(true);
    const [test, setTest] = useState(false);
    const [mobileListShow, setMobileListShow] = useState(false);
    const [users, setUsers] = useState([]);
    const [typeKnower, setTypeKnower] = useState("connected");
    const [emit, setEmit] = useState({
        id: " ",
        mode: false
    })

    // if any error;
    if (!renderPart) {
        console.log("expire token", renderPart);
        localStorage.clear();
        return (
            <>
                <Error404 />
            </>
        )
    }


    useEffect(() => {
        try {
            if (!ConnectedUserList.length) {
                console.log("connection")
                setTest(true);
                setUsers(ConnectedUserList);
                let result = null
                const fecthAsync = async () => {
                    const api = new ApiEndPoints();
                    result = await api.fetchAllConnection('/api/v1/students/connection');
                }
                fecthAsync().then(() => {
                    if (result.success) {
                        // process write filteration;
                        const { data } = result;
                        const arrangeData = data.reduce((acum, item) => {
                            if (item.member_one?._id == studentProfile.ref_id?._id) {
                                acum?.push({ ...item.member_two, chatID: item.id });
                            } else {
                                acum?.push({ ...item.member_one, chatID: item.id });
                            }
                            return acum;
                        }, []);
                        dispatch(addConnectionList([...arrangeData]))
                        setUsers(ConnectedUserList);
                        setTest(false);
                    } else {
                        localStorage.clear();
                        navi('/error_page');
                    }
                });
            } else {
                setUsers(ConnectedUserList);
            }
        } catch (error) {
            console.log("84 G_chatApp  ", error)
            navi('/error_page');
        }
    }, [ConnectedUserList.length])


    useEffect(() => {
        const handleNewMessage = (data) => {
            if (data.notify === "you receive new message (new connection)") {
                console.log('new connection');
                dispatch(setfirstMessagerSet(data))
            }
        };
        socket.on("notification_new_message", handleNewMessage);
        return () => {
            socket.off("notification_new_message", handleNewMessage);
        };
    }, [studentProfile?.ref_id?._id, ConnectedUserList.length]);

    useEffect(() => {
        dispatch(removeDuplicateValue());
    }, [ConnectedUserList.length])


    useEffect(() => {
        try {
            if (ActiveUserList.length === 0) {
                console.log("active")
                setTest(true);
                setUsers(ConnectedUserList);
                let result = null
                const fecthAsync = async () => {
                    const api = new ApiEndPoints();
                    result = await api.fetchAllActiveUser('/api/v1/students');
                }
                fecthAsync().then(() => {
                    if (result.success) {
                        dispatch(addActiveUserList([...result.data]))
                        setUsers(ConnectedUserList);
                        setTest(false);
                    } else {
                        console.log("Erro G_chat ========================", result);
                        navi('/error_page');
                    }
                });
            }

            setUsers(ConnectedUserList);
        } catch (error) {
            console.log("72 G_chatApp  ", error)
            localStorage.clear();
            navi('/error_page');
        }

        return () => {
            setUsers(null);
        }
    }, [ActiveUserList.length]);

    const ref = useRef(null);
    useEffect(() => {
        if (ref.current === 'Online Student') {
            setTest(false);
            setMobileActionList(ref.current);
        }
        return () => {
            setTest(false);
        }
    }, [OnlineUserList.length])

    const setMobileActionList = (type) => {
        setTypeKnower(type);
        switch (type) {
            case "Add Active Student":
                ref.current = type
                setUsers(ActiveUserList);
                setMobileListShow(false)
                break;
            case "Online Student":
                ref.current = "Online Student"
                setUsers(OnlineUserList);
                setMobileListShow(false)
                break;
            default:
                ref.current = type
                setUsers(ConnectedUserList);
                setMobileListShow(false);
                break;
        }
    };

    const emitTheChatArea = (id, mode) => {
        setEmit(() => {
            return { id: id, mode: mode };
        })
    }

    const debouncingref = useRef();
    const refAcc = useRef([]);

    const inputChangeHandler = (e) => {
        const value = e.target.value.toLowerCase().trim();
        if (value === '') {
            switch (typeKnower) {
                case "Add Active Student":
                    refAcc.current[1].click();
                    break;
                case "Online Student":
                    refAcc.current[0].click();
                    break;
                default:
                    refAcc.current[9].click();
                    break;
            }

            if (debouncingref.current) {
                clearTimeout(debouncingref.current);
            }
            return;
        }
        if (debouncingref.current) {
            clearTimeout(debouncingref.current);
        }
        debouncingref.current = setTimeout(() => {
            const filteredData = ActiveUserList.filter((user) => {
                if (user.firstName.toLowerCase().includes(value)) {
                    return user;
                }
            });
            setUsers(filteredData);
        }, 1050);
    }

    return (
        <>
            {
                test ? <div className='w-full h-full flex justify-center items-center text-white'>loading....</div> :
                    <div className='w-full h-full  bg-gray-900 relative'>
                        <div className="w-full h-full bg-gray-900 text-white flex flex-row">
                            <aside className="lg:w-1/4 w-full border-r border-white/20 p-4">
                                <h1 className="md:text-2xl text-[13px] font-bold mb-4 flex items-center h-[20px] gap-2 ">
                                    <GoVerified className="text-green-400 text-2xl" />
                                    <span>{`${studentProfile?.ref_id?.firstName} ${studentProfile?.ref_id?.lastName}`}</span>
                                    <span className='md:text-[16px] text-[12px] text-gray-500'>{`Roll no ${studentProfile?.ref_id?.rollNumber}`}</span>
                                </h1>
                                <div className='w-full md:h-[5%] h-[7%] my-2 rounded-md flex justify-start items-center gap-x-[4%]'>
                                    <div
                                        ref={(el) => {
                                            refAcc.current[9] = el;
                                        }}
                                        onClick={() => {
                                            setTypeKnower('default');
                                            setUsers(ConnectedUserList);
                                        }}
                                        className='md:w-[20%] w-[30%] h-[80%] border-2 border-gray-500 border-dotted rounded-md content-center text-center
                             text-gray-300 hover:bg-gray-600 hover:border-solid cursor-pointer active:bg-gray-400 font-normal'>Chat</div>
                                    <div
                                        onClick={() => { alert("Not available for you, under development") }}
                                        className='md:w-[20%] w-[30%] h-[80%] border-2 border-gray-500 border-dotted rounded-md content-center text-center
                             text-gray-300 hover:bg-gray-600 hover:border-solid cursor-pointer active:bg-gray-400 font-normal'>Guild</div>
                                </div>
                                <div className="relative mb-4">
                                    <FaSearch className="absolute left-3 top-3 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search friends..."
                                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                                        onChange={(e) => inputChangeHandler(e)}
                                    />
                                </div>

                                <ShowConnectedFri
                                    users={users}
                                    emitTheChatArea={emitTheChatArea}
                                    setLoading={setLoading}
                                    loading={loading}
                                />
                            </aside>
                            {
                                mobileListShow && <div className={`md:hidden flex w-full h-[90%] bg-gray-900/90 absolute bottom-1 right-0 transition duration-700`}>
                                    <MobileActionList setMobileActionList={setMobileActionList} refAcc={refAcc} />
                                </div>
                            }

                            <div
                                onClick={() => {
                                    setMobileListShow(!mobileListShow);
                                }}
                                className={`md:hidden flex justify-center items-center text-3xl  border-4  ${mobileListShow ? "border-red-500" : "border-blue-500"}  w-[56px] h-[56px] rounded-full fixed top-[79%] right-[7%]`}>
                                <SiGooglegemini />
                            </div>

                            <div className='md:w-[200px] w-[30px] text-white hidden md:flex justify-center pt-[100px] bg-gray-800 h-full'>
                                <MobileActionList setMobileActionList={setMobileActionList} refAcc={refAcc} />
                            </div>

                            <main className="flex-1 md:flex flex-col hidden">
                                {
                                    emit?.mode ? <ChatArea renderPart={true} idByProps={emit?.id} /> : <div className="w-full h-full bg-gray-900 flex justify-center items-start pt-10 md:items-center md:pt-0 flex-col">
                                        <PulseLoadingSpinner /><br />
                                        <h2 className="text-white font-medium flex justify-center items-center shadow-xls gap-2 mx-auto">
                                            Geman.ai feels to connect<AiFillFire className="text-red-500" />
                                            <p>v-2.0.1</p>
                                        </h2>
                                        <p className='text-white font-medium text-sm flex justify-center items-center shadow-xls gap-2 mx-auto'>start chatting with friends</p>
                                    </div>
                                }
                            </main>
                        </div>
                    </div>
            }
        </>

    )

}

export default G_chatApp;