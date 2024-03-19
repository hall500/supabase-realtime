import "@blocknote/core/fonts/inter.css";
import { BlockNoteView, useCreateBlockNote } from "@blocknote/react";
import "@blocknote/react/style.css";
import { useEffect, useRef } from "react";
import "../styles.css";
import { ROOM, channel } from '../supabase';
import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";
import { faker } from '@faker-js/faker';

const doc = new Y.Doc();
const provider = new WebrtcProvider(ROOM, doc);

export default function Blocknote() {
  const subscriptionRef = useRef(null);

  const editor = useCreateBlockNote({
    collaboration: {
      provider,
      fragment: doc?.getXmlFragment("document-store"),
      user: {
        name: faker.person.fullName(),
        color: faker.color.rgb(),
      },
    },
  });

  useEffect(() => {
    // Subscribe to the Channel
    if (!subscriptionRef.current?.joinedOnce) {
      try {
        subscriptionRef.current = channel;
        subscriptionRef.current.on('broadcast', { event: 'test' }, ({ payload }) => {
            const updatedDoc = Uint8Array.from(payload.doc);
            Y.applyUpdate(doc, updatedDoc);
          })
          .subscribe();
      } catch (error) {
        console.log('Failed to load');
      }
    }
  });

  const handleEditorChange = () => {
    if(subscriptionRef.current){
      subscriptionRef.current.send({
        type: 'broadcast',
        event: 'test',
        payload: { doc: Array.from(Y.encodeStateAsUpdate(doc)) },
      });
    }
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
    </div>
  );
}