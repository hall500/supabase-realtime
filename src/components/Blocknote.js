import "@blocknote/core/fonts/inter.css";
import { BlockNoteView, useCreateBlockNote } from "@blocknote/react";
import "@blocknote/react/style.css";
import { useEffect, useRef, useState } from "react";
import "../styles.css";
import { channel } from '../supabase';

export default function Blocknote() {
  const [blocks, setBlocks] = useState([]);
  const subscriptionRef = useRef(null);

  const editor = useCreateBlockNote({
  });

  useEffect(() => {
    // Subscribe to the Channel
    if (!subscriptionRef?.current?.joinedOnce) {
      subscriptionRef.current = channel;
      channel.on('broadcast', { event: 'test' }, ({ payload }) => {
          setBlocks(payload.blocks);
        })
        .subscribe();
    }
  
    // Clean up subscription on component unmount
    return () => {
      subscriptionRef.current?.unsubscribe();
    };
  }, []);

  const handleEditorChange = () => {
    const blocks = editor.document;
    setBlocks(blocks);
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