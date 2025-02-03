export interface ReceiveMessageResponse {
    receiptId: number;
    body: {
        typeWebhook: string;
        instanceData: {
            idInstance: number;
            wid: string;
            typeInstance: 'whatsapp';
        };
        timestamp: Date;
        idMessage: string;
        senderData: {
            chatId: string;
            chatName: string;
            sender: string;
            senderName: string;
            senderContactName: string;
        };
        messageData: {
            typeMessage: 'textMessage' | 'extendedTextMessage';
            textMessageData: {
                textMessage: string;
            };
        };
    };
}

export interface useGreenApiI {
    apiToken: string;
    instanceId: string;
    chatId: string;
    setCurrentMessage: (text: string) => void;
    isAuth: boolean;
}

export interface IMessage {
    text: string;
    type: "received" | "sent";
    chatId: string;
    time: Date
}