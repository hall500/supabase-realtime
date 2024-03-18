import "@blocknote/core/fonts/inter.css";
import { BlockNoteView, useCreateBlockNote } from "@blocknote/react";
import "@blocknote/react/style.css";
import { useEffect, useMemo, useState } from "react";
import "../styles.css";

import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";
import { v4 as uuidv4 } from 'uuid';

const useCollaborativeEditor = () => {
  const [doc, setDoc] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [provider, setProvider] = useState(null);

  useEffect(() => {
    const existingDoc = Y.Doc.getByUUID(window.location.pathname.split('/').pop());
    if (existingDoc) {
      setDoc(existingDoc);
      return;
    }
    
    const newDoc = new Y.Doc();
    setDoc(newDoc);
  }, []);

  setProvider(useMemo(() => {
    if (!isConnected) {
      const newProvider = new WebrtcProvider("station-test-document", doc, { maxConns: 70 + Math.floor(Math.random() * 70) });
      setIsConnected(true);
      setProvider(newProvider);
      return newProvider;
    }

    return provider;
  }, [doc, isConnected, provider]));

  const editor = useCreateBlockNote({
    collaboration: {
      provider,
      fragment: doc.getXmlFragment("document-store"),
      user: {
        name: uuidv4(),
        color: "#ff0000",
      },
    },
  });

  useEffect(() => {
    return () => {
      if(provider) provider.disconnect();
    };
  }, [provider]);

  return editor;
};

export default function Blocknote() {
  const [blocks, setBlocks] = useState([]);
  const editor = useCollaborativeEditor();

  return (
    <div className={"wrapper"}>
      <div>BlockNote Editor:</div>
      <div className={"item"}>
        <BlockNoteView
          editor={editor}
          onChange={() => {
            //const block = editor.getTextCursorPosition().block;
            setBlocks(editor.document);
          }}
        />
      </div>
      <div>Document JSON:</div>
      <div className={"item bordered"}>
        <pre>
          <code>{JSON.stringify(blocks, null, 2)}</code>
        </pre>
      </div>
    </div>
  );
}