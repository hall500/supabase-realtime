// import * as promise from 'lib0/promise';
// import * as map from 'lib0/map'
// import * as encoding from 'lib0/encoding'
// import * as decoding from 'lib0/decoding'
// import * as cryptoutils from './crypto.js';
// import { ObservableV2 } from 'lib0/observable'

// import * as syncProtocol from 'y-protocols/sync';
// import * as awarenessProtocol from 'y-protocols/awareness';

// import { createClient } from '@supabase/supabase-js'

// const SUPABASE_URL = 'https://piqixymqdxpegdifawkx.supabase.co'
// const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpcWl4eW1xZHhwZWdkaWZhd2t4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTA0ODY3OTQsImV4cCI6MjAyNjA2Mjc5NH0.xwlPtwsQ_u5zTabnJ0jodIUrqPH7VJJCA9VLTOzi5a8'

// export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// const messageSync = 0
// const messageQueryAwareness = 3
// const messageAwareness = 1
// const messageBcPeerId = 4

// const signalingConns = new Map()

// const rooms = new Map()

// const checkIsSynced = room => {
//     let synced = true
//     room.webrtcConns.forEach(peer => {
//       if (!peer.synced) {
//         synced = false
//       }
//     })
//     if ((!synced && room.synced) || (synced && !room.synced)) {
//       room.synced = synced
//       room.provider.emit('synced', [{ synced }])
//       console.log('synced ', room.name, ' with all peers')
//     }
// }

// const readMessage = (room, buf, syncedCallback) => {
//     const decoder = decoding.createDecoder(buf)
//     const encoder = encoding.createEncoder()
//     const messageType = decoding.readVarUint(decoder)
//     if (room === undefined) {
//       return null
//     }
//     const awareness = room.awareness
//     const doc = room.doc
//     let sendReply = false
//     switch (messageType) {
//       case messageSync: {
//         encoding.writeVarUint(encoder, messageSync)
//         const syncMessageType = syncProtocol.readSyncMessage(decoder, encoder, doc, room)
//         if (syncMessageType === syncProtocol.messageYjsSyncStep2 && !room.synced) {
//           syncedCallback()
//         }
//         if (syncMessageType === syncProtocol.messageYjsSyncStep1) {
//           sendReply = true
//         }
//         break
//       }
//       case messageQueryAwareness:
//         encoding.writeVarUint(encoder, messageAwareness)
//         encoding.writeVarUint8Array(encoder, awarenessProtocol.encodeAwarenessUpdate(awareness, Array.from(awareness.getStates().keys())))
//         sendReply = true
//         break
//       case messageAwareness:
//         awarenessProtocol.applyAwarenessUpdate(awareness, decoding.readVarUint8Array(decoder), room)
//         break
//       case messageBcPeerId: {
//         const add = decoding.readUint8(decoder) === 1
//         const peerName = decoding.readVarString(decoder)
//         if (peerName !== room.peerId && ((room.bcConns.has(peerName) && !add) || (!room.bcConns.has(peerName) && add))) {
//           const removed = []
//           const added = []
//           if (add) {
//             room.bcConns.add(peerName)
//             added.push(peerName)
//           } else {
//             room.bcConns.delete(peerName)
//             removed.push(peerName)
//           }
//           room.provider.emit('peers', [{
//             added,
//             removed,
//             webrtcPeers: Array.from(room.webrtcConns.keys()),
//             bcPeers: Array.from(room.bcConns)
//           }])
//           broadcastBcPeerId(room)
//         }
//         break
//       }
//       default:
//         console.error('Unable to compute message')
//         return encoder
//     }
//     if (!sendReply) {
//       // nothing has been written, no answer created
//       return null
//     }
//     return encoder
//   }

//   const readPeerMessage = (peerConn, buf) => {
//     const room = peerConn.room
//     console.log('received message from ', peerConn.remotePeerId, ' (', room.name, ')')
//     return readMessage(room, buf, () => {
//       peerConn.synced = true
//       console.log('synced ', room.name, ' with ', peerConn.remotePeerId)
//       checkIsSynced(room)
//     })
//   }

//   /**
//    * @param {WebrtcConn} webrtcConn
//    * @param {encoding.Encoder} encoder
//    */
//   const sendWebrtcConn = (webrtcConn, encoder) => {
//     console.log('send message to ', webrtcConn.remotePeerId, ' (', webrtcConn.subTopic, ')')
//     try {
//       webrtcConn.peer.send(encoding.toUint8Array(encoder))
//     } catch (e) {}
//   }

//   /**
//    * @param {Room} room
//    * @param {Uint8Array} m
//    */
//   const broadcastWebrtcConn = (room, m) => {
//     console.log('broadcast message in ', room.name)
//     room.webrtcConns.forEach(conn => {
//       try {
//         conn.peer.send(m)
//       } catch (e) {}
//     })
//   }

//   export class SupabaseConn {
//     constructor (remotePeerId, room) {
//       console.log('establishing connection to ', remotePeerId)
//       this.room = room
//       this.remotePeerId = remotePeerId
//       this.glareToken = undefined
//       this.closed = false
//       this.connected = false
//       this.synced = false
//       /**
//        * @type {any}
//        */
//       this.peer = supabase.channel(this.room)
//       this.peer.on('signal', signal => {
//         if (this.glareToken === undefined) {
//           // add some randomness to the timestamp of the offer
//           this.glareToken = Date.now() + Math.random()
//         }
//         //publishSignalingMessage(room, { to: remotePeerId, from: room.peerId, type: 'signal', token: this.glareToken, signal })
//         //TODO: pushing message
//       })
//       this.peer.on('connect', () => {
//         console.log('connected to ', remotePeerId)
//         this.connected = true
//         // send sync step 1
//         const provider = room.provider
//         const doc = provider.doc
//         const awareness = room.awareness
//         const encoder = encoding.createEncoder()
//         encoding.writeVarUint(encoder, messageSync)
//         syncProtocol.writeSyncStep1(encoder, doc)
//         sendWebrtcConn(this, encoder)
//         const awarenessStates = awareness.getStates()
//         if (awarenessStates.size > 0) {
//           const encoder = encoding.createEncoder()
//           encoding.writeVarUint(encoder, messageAwareness)
//           encoding.writeVarUint8Array(encoder, awarenessProtocol.encodeAwarenessUpdate(awareness, Array.from(awarenessStates.keys())))
//           sendWebrtcConn(this, encoder)
//         }
//       })
//       this.peer.on('close', () => {
//         this.connected = false
//         this.closed = true
//         if (room.webrtcConns.has(this.remotePeerId)) {
//           room.webrtcConns.delete(this.remotePeerId)
//           room.provider.emit('peers', [{
//             removed: [this.remotePeerId],
//             added: [],
//             webrtcPeers: Array.from(room.webrtcConns.keys()),
//             bcPeers: Array.from(room.bcConns)
//           }])
//         }
//         checkIsSynced(room)
//         this.peer.destroy()
//         console.log('closed connection to ', remotePeerId)
//         announceSignalingInfo(room)
//       })
//       this.peer.on('error', err => {
//         console.log('Error in connection to ', remotePeerId, ': ', err)
//         announceSignalingInfo(room)
//       })
//       this.peer.on('data', data => {
//         const answer = readPeerMessage(this, data)
//         if (answer !== null) {
//           sendWebrtcConn(this, answer)
//         }
//       })
//     }

//     destroy () {
//       this.peer.destroy()
//     }
//   }

//   const broadcastBcMessage = (room, m) => cryptoutils.encrypt(m, room.key).then(data =>
//     room.mux(() =>
//       bc.publish(room.name, data)
//     )
//   )

//   /**
//    * @param {Room} room
//    * @param {Uint8Array} m
//    */
//   const broadcastRoomMessage = (room, m) => {
//     if (room.bcconnected) {
//       broadcastBcMessage(room, m)
//     }
//     broadcastWebrtcConn(room, m)
//   }

//   /**
//    * @param {Room} room
//    */
//   const announceSignalingInfo = room => {
//     signalingConns.forEach(conn => {
//       // only subscribe if connection is established, otherwise the conn automatically subscribes to all rooms
//       if (conn.connected) {
//         conn.send({ type: 'subscribe', topics: [room.name] })
//         if (room.webrtcConns.size < room.provider.maxConns) {
//           publishSignalingMessage(conn, room, { type: 'announce', from: room.peerId })
//         }
//       }
//     })
//   }

//   /**
//    * @param {Room} room
//    */
//   const broadcastBcPeerId = room => {
//     if (room.provider.filterBcConns) {
//       // broadcast peerId via broadcastchannel
//       const encoderPeerIdBc = encoding.createEncoder()
//       encoding.writeVarUint(encoderPeerIdBc, messageBcPeerId)
//       encoding.writeUint8(encoderPeerIdBc, 1)
//       encoding.writeVarString(encoderPeerIdBc, room.peerId)
//       broadcastBcMessage(room, encoding.toUint8Array(encoderPeerIdBc))
//     }
//   }

// const emitStatus = provider => {
//     provider.emit('status', [{
//       connected: provider.connected
//     }])
// }

// export class SupabaseProvider extends ObservableV2 {
//     /**
//      * @param {string} roomName
//      * @param {Y.Doc} doc
//      * @param {ProviderOptions?} opts
//      */
//     constructor (
//       roomName,
//       doc,
//       {
//         channel = null,
//         tableName = null,
//         columnName = null,
//         idName = null,
//         id = null,
//         awareness = new awarenessProtocol.Awareness(doc),
//         resyncInterval = false,
//         maxConns = 20 + Math.floor(Math.random() * 15), // the random factor reduces the chance that n clients form a cluster
//         filterBcConns = true,
//         peerOpts = {} // simple-peer options. See https://github.com/feross/simple-peer#peer--new-peeropts
//       } = {}
//     ) {
//       super()
//       this.roomName = roomName
//       this.doc = doc
//       this.filterBcConns = filterBcConns
//       /**
//        * @type {awarenessProtocol.Awareness}
//        */
//       this.awareness = this.config.awareness || new awarenessProtocol.Awareness(doc)
//       this.shouldConnect = false
//       this.signalingConns = []
//       this.maxConns = maxConns
//       this.peerOpts = peerOpts
//       /**
//        * @type {PromiseLike<CryptoKey | null>}
//        */
//       this.key = promise.resolve(null);
//       /**
//        * @type {Room|null}
//        */
//       this.room = null
//       this.key.then(key => {
//         this.room = openRoom(doc, this, roomName, key)
//         if (this.shouldConnect) {
//           this.room.connect()
//         } else {
//           this.room.disconnect()
//         }
//         emitStatus(this)
//       })
//       this.connect()
//       this.destroy = this.destroy.bind(this)
//       doc.on('destroy', this.destroy)
//     }

//     get connected () {
//       return this.room !== null && this.shouldConnect
//     }

//     connect () {
//       this.shouldConnect = true
//       this.signalingUrls.forEach(url => {
//         const signalingConn = map.setIfUndefined(signalingConns, url, () => new SignalingConn(url))
//         this.signalingConns.push(signalingConn)
//         signalingConn.providers.add(this)
//       })
//       if (this.room) {
//         this.room.connect()
//         emitStatus(this)
//       }
//     }

//     disconnect () {
//       this.shouldConnect = false
//       this.signalingConns.forEach(conn => {
//         conn.providers.delete(this)
//         if (conn.providers.size === 0) {
//           conn.destroy()
//           signalingConns.delete(conn.url)
//         }
//       })
//       if (this.room) {
//         this.room.disconnect()
//         emitStatus(this)
//       }
//     }

//     destroy () {
//       this.doc.off('destroy', this.destroy)
//       // need to wait for key before deleting room
//       this.key.then(() => {
//         /** @type {Room} */ (this.room).destroy()
//         rooms.delete(this.roomName)
//       })
//       super.destroy()
//     }
//   }
