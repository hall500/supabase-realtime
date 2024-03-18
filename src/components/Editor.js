/* eslint-disable react-hooks/exhaustive-deps */
import { default as React, useEffect, useRef, useState } from 'react';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header'; 
import { initSocket } from '../socket';
import {
    useLocation,
    useNavigate,
} from 'react-router-dom';
import { ACTIONS } from '../Actions';
 
const DEFAULT_INITIAL_DATA = () => {
  return {
    "time": new Date().getTime(),
    "blocks": [
      {
        "type": "header",
        "data": {
          "text": "This is my awesome editor!",
          "level": 1
        }
      },
    ]
  }
}
 
const EDITTOR_HOLDER_ID = 'editorjs';
 
const Editor = (props) => {
  const socketRef = useRef(null);
  const codeRef = useRef(null);
  const location = useLocation();
  const ejInstance = useRef();
  const reactNavigator = useNavigate();
  //const [clients, setClients] = useState([]);
  const [editorData, setEditorData] = React.useState(DEFAULT_INITIAL_DATA);
  const [roomId ] = useState('room-01');
 
  useEffect(() => {
    if (!ejInstance?.current) {
      initEditor();
    }
    return () => {
      if(ejInstance?.current) ejInstance.current.destroy();
      ejInstance.current = null;
    }
  }, []);

  useEffect(() => {
    const init = async () => {
        socketRef.current = await initSocket();
        socketRef.current.on('connect_error', (err) => handleErrors(err));
        socketRef.current.on('connect_failed', (err) => handleErrors(err));

        function handleErrors(e) {
            console.log('socket error', e);
            console.log('Socket connection failed, try again later.');
            //toast.error('Socket connection failed, try again later.');
            reactNavigator('/');
        }

        socketRef.current.emit(ACTIONS.JOIN, {
            roomId,
            username: location.state?.username,
        });

        // Listening for joined event
        socketRef.current.on(
            ACTIONS.JOINED,
            ({ clients, username, socketId }) => {
                if (username !== location.state?.username) {
                    console.log(`${username} joined the room.`);
                    //toast.success(`${username} joined the room.`);
                    console.log(`${username} joined`);
                }
                //setClients(clients);
                socketRef.current.emit(ACTIONS.SYNC_CODE, {
                    code: codeRef.current,
                    socketId,
                });
            }
        );

        // Listening for disconnected
        socketRef.current.on(
            ACTIONS.DISCONNECTED,
            ({ socketId, username }) => {
                console.log(`${username} left the room.`);
                //toast.success(`${username} left the room.`);
                // setClients((prev) => {
                //     return prev.filter(
                //         (client) => client.socketId !== socketId
                //     );
                // });
            }
        );
    };
    init();
    return () => {
        socketRef.current.disconnect();
        socketRef.current.off(ACTIONS.JOINED);
        socketRef.current.off(ACTIONS.DISCONNECTED);
    };
}, []);

 
  const initEditor = () => {
    const editor = new EditorJS({
      holder: EDITTOR_HOLDER_ID,
      logLevel: "ERROR",
      data: editorData,
      onReady: () => {
        ejInstance.current = editor;
      },
      onChange: async () => {
        const index = editor.blocks.getCurrentBlockIndex();
        const block = await editor.blocks.getBlockByIndex(index).save();
        console.log('block: ', {
            index,
            block
        });

        let content = await editor.saver.save();
        setEditorData(content);
      },
      autofocus: true,
      tools: { 
        header: Header, 
      }, 
    });
  };
 
  return (
    <React.Fragment>
      <div id={EDITTOR_HOLDER_ID}> </div>
    </React.Fragment>
  );
}
 
export default Editor;