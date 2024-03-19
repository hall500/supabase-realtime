import "@blocknote/core/fonts/inter.css";
import { BlockNoteView, useCreateBlockNote } from "@blocknote/react";
import "@blocknote/react/style.css";
import { useEffect, useRef, useState } from "react";
import "../styles.css";
import { channel } from '../supabase';

// const doc = new Y.Doc({ guid: uuidv4(), collectionid: ROOM });
// const provider = new WebrtcProvider(ROOM, doc);
export default function Blocknote() {
  const [blocks, setBlocks] = useState([]);
  const subscriptionRef = useRef(null);

  const editor = useCreateBlockNote({
    // collaboration: {
    //   provider,
    //   fragment: doc?.getXmlFragment("document-store"),
    //   user: {
    //     name: faker.person.fullName(),
    //     color: faker.color.rgb(),
    //   },
    // },
  });

  useEffect(() => {
    // Subscribe to the Channel
    if (!subscriptionRef.current?.joinedOnce) {
      try {
        subscriptionRef.current = channel;
        subscriptionRef.current.on('broadcast', { event: 'test' }, ({ payload }) => {
            console.log(payload);
            setBlocks(payload.blocks);
            //Y.applyUpdate(doc, payload.update);
          })
          .subscribe();
      } catch (error) {
        console.log('Failed to load');
      }
    }
  });

  const handleEditorChange = () => {
    const blocks = editor.getTextCursorPosition().block;
    setBlocks(blocks);
    // if(subscriptionRef.current){
    //   subscriptionRef.current.send({
    //     type: 'broadcast',
    //     event: 'test',
    //     payload: { blocks },
    //   });
    // }
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