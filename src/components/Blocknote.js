import "@blocknote/core/fonts/inter.css";
import { BlockNoteView, useCreateBlockNote } from "@blocknote/react";
import "@blocknote/react/style.css";
import { useEffect, useRef, useState } from "react";
import "../styles.css";
import { ROOM, channel } from "../supabase";
import { faker } from '@faker-js/faker';
import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";

export default function Blocknote() {
  const [blocks, setBlocks] = useState([]);
  const subscriptionRef = useRef(null);
  const docRef = useRef(null);
  const providerRef = useRef(null);

  useEffect(() => {
    if (!docRef?.current) { // Check if not already subscribed
      console.log('creating document');
      docRef.current = new Y.Doc({ collectionid: ROOM });
    }
    
    if (!providerRef?.current) { // Check if not already subscribed
      console.log('creating provider');
      providerRef.current = new WebrtcProvider(docRef.current);
    }

  });

  useEffect(() => {
    if (!subscriptionRef?.current?.joinedOnce) { // Check if not already subscribed
      subscriptionRef.current = channel;
      subscriptionRef.current.on('broadcast', { event: 'test' }, ({ payload }) =>{

      }).subscribe();
    }
  });

  const collabo = (providerRef.current) ? {
    // The Yjs Provider responsible for transporting updates:
    provider: providerRef.current,
    // Where to store BlockNote data in the Y.Doc:
    fragment: docRef.current?.getXmlFragment("document-store"),
    // Information (name and color) for this user:
    user: {
      name: faker.person.fullName(),
      color: "#ff0000",
    },
  } : {};

  const editor = useCreateBlockNote({
    collaboration: collabo,
  });

  const handleEditorChange = () => {
    //const block = editor.getTextCursorPosition().block;
    setBlocks(editor.document);
    // Send a message once the client is subscribed
    if(subscriptionRef.current) subscriptionRef.current.send({
      type: 'broadcast',
      event: 'test',
      payload: { blocks },
    });
  }

  return (
    <div className={"wrapper"}>
      <div>BlockNote Editor:</div>
      <div className={"item"}>
        <BlockNoteView
          editor={editor}
          onChange={handleEditorChange}
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