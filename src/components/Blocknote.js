import "@blocknote/core/fonts/inter.css";
import { BlockNoteView, useCreateBlockNote } from "@blocknote/react";
import "@blocknote/react/style.css";
import { useEffect, useRef, useState } from "react";
import "../styles.css";
import { ROOM, channel } from "../supabase";
import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";
import { faker } from "@faker-js/faker";

const doc = new Y.Doc();
const provider = new WebrtcProvider(ROOM, doc);
const name = faker.person.fullName();
const color = faker.color.rgb();

export default function Blocknote() {
  const subscriptionRef = useRef(null);
  const [blocks, setBlocks] = useState([])

  const editor = useCreateBlockNote({
    collaboration: {
      provider,
      fragment: doc?.getXmlFragment("document-store"),
      user: {
        name,
        color,
      },
    },
  });

  useEffect(() => {
    // Subscribe to the Channel
    if (!subscriptionRef.current?.joinedOnce) {
      try {
        subscriptionRef.current = channel;
        subscriptionRef.current
          .on("broadcast", { event: "test" }, ({ payload }) => {
            const updatedDoc = Uint8Array.from(payload.doc);
            Y.applyUpdate(doc, updatedDoc);
          })
          .subscribe();
      } catch (error) {
        console.log("Failed to load");
      }
    }
  });

  const handleEditorChange = () => {
    setBlocks(editor.document);
    if (subscriptionRef.current) {
      subscriptionRef.current.send({
        type: "broadcast",
        event: "test",
        payload: { name, color, doc: Array.from(Y.encodeStateAsUpdate(doc)) },
      });
    }
  };

  return (
    <div className={"wrapper"}>
      <div>BlockNote Editor:</div>
      <div className={"item"}>
        <BlockNoteView editor={editor} onChange={handleEditorChange} />
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
