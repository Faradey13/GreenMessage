import React, {useEffect, useState} from "react";
import "./Chat.css";
import {Send, UserRoundPlus, CircleUserRound} from "lucide-react";
import {useGreenAPI} from "../useGreenAPI/useGreenAPI.ts";



const Chat: React.FC = () => {
    const tokenInstance = localStorage.getItem("tokenInstance");
    const idInstance = localStorage.getItem("idInstance");
    const [instanceId, setInstanceId] = useState<string>(idInstance ? idInstance : '');
    const [apiInstanceKey, setApiInstanceKey] = useState<string>(tokenInstance ? tokenInstance : '' );
    const [currentMessage, setCurrentMessage] = useState<string>('');
    const [inputNewChatValue, setInputNewChatValue] = useState('');
    const [chats, setNewChat] = useState<string[]>([]);
    const [chatId, setChatId] = useState<string>('');
    const [isFakeLogin, setIsFakeLogin] = useState<boolean>();

    const {messages, sendMessage} = useGreenAPI(
        {apiToken: apiInstanceKey,
            instanceId: instanceId,
            chatId:chatId,
            setCurrentMessage:
            setCurrentMessage});
    useEffect(() => {
        if(localStorage.getItem("tokenInstance"))
            setIsFakeLogin(true)
    }, []);
    useEffect(() => {
        const keyDownHandler = async (event: KeyboardEvent) => {
            if (event.key === 'Enter' && currentMessage.trim()) {
                event.preventDefault();
               await sendMessage(currentMessage);
            }
        };
        document.addEventListener('keydown', keyDownHandler);
        return () => {
            document.removeEventListener('keydown', keyDownHandler);
        };
    }, [currentMessage]);

    useEffect(() => {
        if(isFakeLogin){
        const oldChats = localStorage.getItem('chatsId');
        if (oldChats) {
            const parsedChats = JSON.parse(oldChats);
            setNewChat(parsedChats);
            if (parsedChats.length > 0) {
                setChatId(parsedChats[0]);
            }
        }}
    }, [isFakeLogin]);

    const logout = () => {
        setIsFakeLogin(false);
        localStorage.removeItem("tokenInstance");
        localStorage.removeItem("idInstance");
        setApiInstanceKey('')
        setInstanceId('')
        setChatId('')
        setNewChat([])
    }
    const addNewChat = () => {
        if (isFakeLogin && inputNewChatValue.trim()) {
            setNewChat(prevChats => {
                const updatedChats = [...prevChats, inputNewChatValue];
                localStorage.setItem('chatsId', JSON.stringify(updatedChats));
                return updatedChats;
            });
            setChatId(inputNewChatValue);
            setInputNewChatValue("");
        }
    };
    const setCurrentChat = (chat: string) => {
        setChatId(chat);
    }
    const  handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsFakeLogin(true);
        const formData = new FormData(e.currentTarget);
        const id = formData.get("id");
        const token = formData.get("token");
        if( id && token) {
            setInstanceId(String(id))
            setApiInstanceKey(String(token));
            localStorage.setItem('idInstance', String(id))
            localStorage.setItem('tokenInstance', String(token))
        }
    }

    return (
        <div className="chat-container">
            <aside className="sidebar">
                <header className="sidebar-header">
                    <div className="new-chat">
                        <input
                            className="input"
                            value={inputNewChatValue}
                            onChange={(e) => setInputNewChatValue(e.target.value)}
                            type="text"
                            placeholder="Введите телефон"/>
                        <UserRoundPlus size={25} className="add-chat" onClick={addNewChat}/>
                    </div>
                </header>
                <ul className="chat-list">
                    {
                        chats.map((chat) =>
                            <li style={chat === chatId ? {background: "#f9f9f9"} : {}} key={chat} className="chat-item" onClick={() => setCurrentChat(chat)}>
                                <div className="chat-info">
                                    <h3>{chat}</h3>
                                </div>
                            </li>
                        )
                    }

                </ul>
            </aside>


            <main className="chat-window">
                <header className="chat-header">
                    <div>
                    {
                            !instanceId ? <form className="instance-form" onSubmit={handleSubmit}>
                                    <input
                                        className="input"
                                        type="text"
                                        name="id"
                                        placeholder="Введите id instance"/>
                                    <input
                                        className="input"
                                        type="text"
                                        name="token"
                                        placeholder="Введите  api token instance"/>
                                    <button className="button" type="submit">Добавить инстанс</button>
                                </form> :
                                <div className="instance">
                                    <CircleUserRound size={25}/>
                                    <h3>Инстанс: {instanceId}</h3>
                                </div>}
                    </div>
                    {instanceId && <button className="button" onClick={logout}>Выйти</button>}
                </header>
                <div className="messages">
                    {messages.map((message, index) => message.type === 'sent' ?
                        <div key={index} className="message sent">{message.text}</div> :
                        <div key={index} className="message received">{message.text}</div>)
                    }
                </div>
                <footer className="chat-input">
                    <input type="text"
                           placeholder="Введите сообщение..."
                           value={currentMessage}
                           onChange={(e) => setCurrentMessage(e.target.value)}
                    />
                    <button onClick={() => sendMessage(currentMessage)}>
                        <Send size={25}/>
                    </button>
                </footer>
            </main>
        </div>
    );
};
export default Chat;