import { BlockNoteEditor } from "@blocknote/core";
import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/react";
import "@blocknote/react/style.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { ROOM, channel } from '../supabase';
import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";
import { faker } from '@faker-js/faker';

let doc, provider;
try {
  doc = new Y.Doc();
  provider = new WebrtcProvider(ROOM, doc);
} catch (error) {
  console.log('An error occurred')
}
 
async function saveToStorage(jsonBlocks) {
  // Save contents to local storage. You might want to debounce this or replace
  // with a call to your API / database.
  localStorage.setItem("editorContent", JSON.stringify(jsonBlocks));
}
 
async function loadFromStorage() {
  // Gets the previously stored editor contents.
  const storageString = localStorage.getItem("editorContent");
  return storageString
    ? (JSON.parse(storageString))
    : undefined;
}
 
export default function App() {
  const [initialContent, setInitialContent] = useState("loading");
  const subscriptionRef = useRef(null);
 
  // Loads the previously stored editor contents.
  useEffect(() => {
    loadFromStorage().then((content) => {
      setInitialContent(content);
    });
  }, []);
 
  // Creates a new editor instance.
  // We use useMemo + createBlockNoteEditor instead of useCreateBlockNote so we
  // can delay the creation of the editor until the initial content is loaded.
  const editor = useMemo(() => {
    if (initialContent === "loading") {
      return undefined;
    }

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

    return BlockNoteEditor.create({ 
      initialContent,
      collaboration: {
        provider,
        fragment: doc?.getXmlFragment("document-store"),
        user: {
          name: faker.person.fullName(),
          color: faker.color.rgb(),
        },
      }, 
    });
  }, [initialContent]);
 
  if (editor === undefined) {
    return "Loading content...";
  }
 
  // Renders the editor instance.
  return (
    <BlockNoteView
      editor={editor}
      onChange={() => {
        saveToStorage(editor.document);
        if(subscriptionRef.current){
          subscriptionRef.current.send({
            type: 'broadcast',
            event: 'test',
            payload: { doc: Array.from(Y.encodeStateAsUpdate(doc)) },
          });
        }
      }}
    />
  );
}