import $api from "../../utils/axios.ts";
import {AxiosError} from "axios";
import {useEffect, useState} from "react";
import {IMessage, ReceiveMessageResponse, useGreenApiI} from "./type.ts";

export const useGreenAPI = (props: useGreenApiI) => {
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [allMessages, setAllMessages] = useState<IMessage[]>([]);

    const getMessagesForCurrentChatId = (chatId: string): IMessage[] => {
        return allMessages.filter(
            (message: IMessage) => message.chatId === chatId
        );
    };

    useEffect(() => {
        setMessages(getMessagesForCurrentChatId(props.chatId));
    }, [props.chatId]);

    useEffect(() => {
        const existingMessages = JSON.parse(localStorage.getItem('messages') || '[]');
        setAllMessages(existingMessages);
    }, []);

    useEffect(() => {
        if(!props.isAuth)return
        let intervalId: number;
        const fetchMessages = async () => {
            const response = await receiveMessage();
            if (response) {
                if (response?.body.typeWebhook === 'incomingMessageReceived' &&
                    response?.body?.messageData?.textMessageData?.textMessage) {
                    const newMessage: IMessage = {
                        text: response.body.messageData.textMessageData.textMessage,
                        type: 'received',
                        chatId: (response.body.senderData.chatId).replace('@c.us', ''),
                        time: response.body.timestamp,
                    };
                    setAllMessages((prevMessages) => [
                        ...prevMessages, newMessage,
                    ]);
                    setMessages(getMessagesForCurrentChatId(props.chatId));
                    const existingMessages = JSON.parse(localStorage.getItem('messages') || '[]');
                    localStorage.setItem('messages', JSON.stringify([...existingMessages, newMessage]));
                    const deleteResponse = await deleteNotification(String(response.receiptId));
                    if (deleteResponse) {
                        startMessageFetch();
                    }
                } else {
                    await deleteNotification(String(response?.receiptId));
                }

            }
        };
        const startMessageFetch = () => {
            intervalId = setInterval(fetchMessages, 5000);
        };
        startMessageFetch();
        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [props.isAuth]);

    const sendMessage = async (message: string) => {
        try {
            if (message.trim()) {
                const newMessage: IMessage = {
                    text: message,
                    type: 'sent',
                    chatId: props.chatId,
                    time: new Date(),
                };
                setAllMessages((prevMessages) => [...prevMessages, newMessage]);
                const existingMessages = JSON.parse(localStorage.getItem('messages') || '[]');
                localStorage.setItem('messages', JSON.stringify([...existingMessages, newMessage]));
                await $api.post(`/waInstance${props.instanceId}/sendMessage/${props.apiToken}`, {
                    chatId: `${props.chatId}@c.us`,
                    message,
                });
                props.setCurrentMessage('');
            }
        } catch (error) {
            if (error instanceof AxiosError) {
                console.error(error.message);
            }
        }
    }

    const receiveMessage = async (): Promise<ReceiveMessageResponse | undefined> => {
        try {
            const response = await $api.get(`/waInstance${props.instanceId}/receiveNotification/${props.apiToken}`)
            if (response.data !== null) {
                return response.data;
            }
        } catch (error) {
            if (error instanceof AxiosError) {
                console.error(error.message);
            }
        }
    }

    const deleteNotification = async (receiptId: string) => {
        try {
            return $api.delete(`/waInstance${props.instanceId}/deleteNotification/${props.apiToken}/${receiptId}`);
        } catch (error) {
            if (error instanceof AxiosError) {
                console.error(error.message);
            }
        }
    }
    return {sendMessage, messages, setMessages};
};