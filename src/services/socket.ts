import {io ,Socket} from  'socket.io-client';
let socket: Socket;

export const connectSocket = () =>{
    const token = localStorage.getItem('jwtToken');
    socket = io('http://localhost:5000',{
        auth : {token},
    });
    return socket;
};
export const getSocket = () => socket