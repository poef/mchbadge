import jsfsPath from './jsfs/src/Path.js'
import struct from './structjs/struct.mjs'

let messageIds = 0

const APFSLIST = 4103,
    EXECFILE = 0,
    HEARTBEAT = 1,
    APPFSBOOT = 3,
    GETDIR = 4096,
    READFILE = 4097,
    WRITEFILE = 4098,
    DELFILE = 4099,
    DUPLFILE = 4100,
    MVFILE = 4101,
    MAKEDIR = 4102,
    APPFSFDIR = 4103,
    APPFSDEL = 4104,
    APPFSWRITE = 4105
    
const magic = 0xFEEDF00D; //0x0DF0EDFE; //0xFEEDF00D
const headerLength = 20

window.struct = struct

function crc32FromArrayBuffer(dsArr) {
    var table = new Uint32Array([
        0x00000000, 0x77073096, 0xee0e612c, 0x990951ba, 0x076dc419, 0x706af48f,
        0xe963a535, 0x9e6495a3, 0x0edb8832, 0x79dcb8a4, 0xe0d5e91e, 0x97d2d988,
        0x09b64c2b, 0x7eb17cbd, 0xe7b82d07, 0x90bf1d91, 0x1db71064, 0x6ab020f2,
        0xf3b97148, 0x84be41de, 0x1adad47d, 0x6ddde4eb, 0xf4d4b551, 0x83d385c7,
        0x136c9856, 0x646ba8c0, 0xfd62f97a, 0x8a65c9ec, 0x14015c4f, 0x63066cd9,
        0xfa0f3d63, 0x8d080df5, 0x3b6e20c8, 0x4c69105e, 0xd56041e4, 0xa2677172,
        0x3c03e4d1, 0x4b04d447, 0xd20d85fd, 0xa50ab56b, 0x35b5a8fa, 0x42b2986c,
        0xdbbbc9d6, 0xacbcf940, 0x32d86ce3, 0x45df5c75, 0xdcd60dcf, 0xabd13d59,
        0x26d930ac, 0x51de003a, 0xc8d75180, 0xbfd06116, 0x21b4f4b5, 0x56b3c423,
        0xcfba9599, 0xb8bda50f, 0x2802b89e, 0x5f058808, 0xc60cd9b2, 0xb10be924,
        0x2f6f7c87, 0x58684c11, 0xc1611dab, 0xb6662d3d, 0x76dc4190, 0x01db7106,
        0x98d220bc, 0xefd5102a, 0x71b18589, 0x06b6b51f, 0x9fbfe4a5, 0xe8b8d433,
        0x7807c9a2, 0x0f00f934, 0x9609a88e, 0xe10e9818, 0x7f6a0dbb, 0x086d3d2d,
        0x91646c97, 0xe6635c01, 0x6b6b51f4, 0x1c6c6162, 0x856530d8, 0xf262004e,
        0x6c0695ed, 0x1b01a57b, 0x8208f4c1, 0xf50fc457, 0x65b0d9c6, 0x12b7e950,
        0x8bbeb8ea, 0xfcb9887c, 0x62dd1ddf, 0x15da2d49, 0x8cd37cf3, 0xfbd44c65,
        0x4db26158, 0x3ab551ce, 0xa3bc0074, 0xd4bb30e2, 0x4adfa541, 0x3dd895d7,
        0xa4d1c46d, 0xd3d6f4fb, 0x4369e96a, 0x346ed9fc, 0xad678846, 0xda60b8d0,
        0x44042d73, 0x33031de5, 0xaa0a4c5f, 0xdd0d7cc9, 0x5005713c, 0x270241aa,
        0xbe0b1010, 0xc90c2086, 0x5768b525, 0x206f85b3, 0xb966d409, 0xce61e49f,
        0x5edef90e, 0x29d9c998, 0xb0d09822, 0xc7d7a8b4, 0x59b33d17, 0x2eb40d81,
        0xb7bd5c3b, 0xc0ba6cad, 0xedb88320, 0x9abfb3b6, 0x03b6e20c, 0x74b1d29a,
        0xead54739, 0x9dd277af, 0x04db2615, 0x73dc1683, 0xe3630b12, 0x94643b84,
        0x0d6d6a3e, 0x7a6a5aa8, 0xe40ecf0b, 0x9309ff9d, 0x0a00ae27, 0x7d079eb1,
        0xf00f9344, 0x8708a3d2, 0x1e01f268, 0x6906c2fe, 0xf762575d, 0x806567cb,
        0x196c3671, 0x6e6b06e7, 0xfed41b76, 0x89d32be0, 0x10da7a5a, 0x67dd4acc,
        0xf9b9df6f, 0x8ebeeff9, 0x17b7be43, 0x60b08ed5, 0xd6d6a3e8, 0xa1d1937e,
        0x38d8c2c4, 0x4fdff252, 0xd1bb67f1, 0xa6bc5767, 0x3fb506dd, 0x48b2364b,
        0xd80d2bda, 0xaf0a1b4c, 0x36034af6, 0x41047a60, 0xdf60efc3, 0xa867df55,
        0x316e8eef, 0x4669be79, 0xcb61b38c, 0xbc66831a, 0x256fd2a0, 0x5268e236,
        0xcc0c7795, 0xbb0b4703, 0x220216b9, 0x5505262f, 0xc5ba3bbe, 0xb2bd0b28,
        0x2bb45a92, 0x5cb36a04, 0xc2d7ffa7, 0xb5d0cf31, 0x2cd99e8b, 0x5bdeae1d,
        0x9b64c2b0, 0xec63f226, 0x756aa39c, 0x026d930a, 0x9c0906a9, 0xeb0e363f,
        0x72076785, 0x05005713, 0x95bf4a82, 0xe2b87a14, 0x7bb12bae, 0x0cb61b38,
        0x92d28e9b, 0xe5d5be0d, 0x7cdcefb7, 0x0bdbdf21, 0x86d3d2d4, 0xf1d4e242,
        0x68ddb3f8, 0x1fda836e, 0x81be16cd, 0xf6b9265b, 0x6fb077e1, 0x18b74777,
        0x88085ae6, 0xff0f6a70, 0x66063bca, 0x11010b5c, 0x8f659eff, 0xf862ae69,
        0x616bffd3, 0x166ccf45, 0xa00ae278, 0xd70dd2ee, 0x4e048354, 0x3903b3c2,
        0xa7672661, 0xd06016f7, 0x4969474d, 0x3e6e77db, 0xaed16a4a, 0xd9d65adc,
        0x40df0b66, 0x37d83bf0, 0xa9bcae53, 0xdebb9ec5, 0x47b2cf7f, 0x30b5ffe9,
        0xbdbdf21c, 0xcabac28a, 0x53b39330, 0x24b4a3a6, 0xbad03605, 0xcdd70693,
        0x54de5729, 0x23d967bf, 0xb3667a2e, 0xc4614ab8, 0x5d681b02, 0x2a6f2b94,
        0xb40bbe37, 0xc30c8ea1, 0x5a05df1b, 0x2d02ef8d
    ]);
    var crc = 0 ^ (-1);
    for(var i = 0; i < dsArr.byteLength; i++) {
        crc = (crc >>> 8) ^ table[(crc ^ dsArr[i]) & 0xFF];
    }
    return (crc ^ (-1)) >>> 0;
}

const packetFormat = {
	'magic': 'I',
	'message_id': 'I',
	'command':'I',
	'payload_lenth':'I',
	'payload_crc':'I'
}


class WebUSBPacket
{
	
	constructor(command, payload=null) 
	{
		this.magic       = magic
		this.command     = command
		this.payload     = payload ? payload : ""
		this.message_id  = messageIds++
		this.payload_crc = payload ? crc32FromArrayBuffer(payload) : 0
	}

	getMessageHeader()
	{
		let formatString = '<'+Object.values(packetFormat).join('')
		return struct(formatString).pack(this.magic, this.message_id, this.command, this.payload.length, this.payload_crc)
	}
	
	getPayload() {
		return this.payload
	}
	
	getMessage() {
		let header = new Uint8Array(this.getMessageHeader())
		let payload = new Uint8Array(this.getPayload())
		console.log('packet header',header)
		console.log('packet payload',payload)		
		console.log(header.length,payload.length)
		let result = new Uint8Array(header.length+payload.length)
		result.set(header)
		result.set(payload, header.length)
		console.log('message from getMessage()',result)
		return result.buffer
	}
	
	static fromPacket(packet) {
		let formatString = '<'+Object.values(packetFormat).join('')
		let [magic,message_id,command,payload_length,payload_crc] = struct(formatString).unpack(packet)
		let data = packet.slice(headerLength)
		if (data.length>=payload_length) {
			//@TODO: crc check
			let packet = new WebUSBPacket(command, data)
		} else {
			let packet = new WebUSBPacket(command)
			packet.payload_length = payload_length
			packet.payload_crc = payload_crc
		}			
		packet.message_id = message_id
		return packet
	}
}

class mchBadgeDriver
{
	#device
	interfaces = []
	#bitstream_state=false
	#bitstream_process_state = 0
	messages = {}
	listeners = []
	listening = []
	
	async sendControl(usbInterface, request, value)
	{
		let endpoint = usbInterface.epOut
		return this.#device.controlTransferOut({
			requestType: 'class',
			recipient: 'interface',
			request: request,
			value: value,
			index: usbInterface.index
		}).then(result => {
			console.log(endpoint.endpointNumber, result)
			return result
		})
	}

	async sendState(usbInterface, state)
	{
		return this.sendControl(usbInterface, 0x22, state)
	}

	async resetEsp32(usbInterface, bootloader_mode = false)
	{
		return this.sendControl(usbInterface, 0x23, bootloader_mode ? 0x01 : 0x00)
	}

	async setBaudrate(usbInterface, baudrate)
	{
		return this.sendControl(usbInterface, 0x24, Math.floor(baudrate/100))
	}

	async setMode(usbInterface, mode)
	{
		return this.sendControl(usbInterface, 0x25, mode)
	}

	setBitstreamMode(mode) {
		this.#bitstream_state = mode
	}

	async wait(time)
	{
		return new Promise(r => setTimeout(r, time))
	}

	async resetEsp32ToWebUSB(usbInterface, webusb_mode = 0x00)
	{
		await this.setMode(usbInterface, webusb_mode)
		await this.wait(50)
		await this.resetEsp32(usbInterface, false)
		await this.wait(50)
		await this.setBaudrate(usbInterface, 115200)
		await this.wait(50)
		this.setBitstreamMode(0)
		if (webusb_mode>0) {
			await this.wait(3000)
//			await this.setBaudrate(usbInterface, 912600)
//			await this.wait(50)
//			await this.setBaudrate(usbInterface, 912600)
//			await this.setBitstreamMode(webusb_mode==0x02)
		}
		return true
	}

	async sendPacket(usbInterface, packet, transfersize=2048)
	{
		console.log('send msg id ',packet.message_id);
		let msg = packet.getMessage()
		console.log('send msg content ',this.bufferToString(msg))
		console.log('send packet ',packet)
		setTimeout(() => {
			this.#device.transferOut(usbInterface.epOut.endpointNumber, msg)
		},1)

		let response = await this.receiveResponse(usbInterface, packet.message_id)
		if (response.message_id!== packet.message_id) {
			throw new Error('response id '+response.message_id+' does not match packet id '+packet.message_id)
		}
		if (response.command!==packet.command) {
			throw new Error('response command '+response.command+' does not match packet '+packet.command)
		}
		return response.data
	}

	async test(command) {
		let packet = new WebUSBPacket(command)
		console.log(packet)
		let response = await this.sendPacket(this.interfaces[0],packet)
		console.log(response)
	}

	async receiveResponse(usbInterface, message_id)
	{
		if (!this.listening[usbInterface.index]) { //epIn.endpointNumber]) {
			this.listen(usbInterface); //epIn.endpointNumber)
		}
		return new Promise(async (resolve, reject) => {
			let timer = setTimeout(() => {
				reject('timeout')
			}, 1000)
			this.listeners[message_id] = (message) => {
				clearTimeout(timer)
				delete this.listeners[message_id]
				delete this.messages[message_id]
				resolve(message)
			}
		})
/*
		let maxLength = 1048576 //1MB for now
		let usbTransferResult
		do {
			usbTransferResult = await this.#device.transferIn(usbInterface.epIn.endpointNumber, maxLength)
			console.log(usbTransferResult)
		} while(usbTransferResult.data.byteLength<payloadHeaderLength)
		if (usbTransferResult.status === 'ok') {
			let [command, payloadlen, verify, message_id] = struct('<HIHI').unpack(usbTransferResult.data.buffer)
			console.log(command, payloadlen, verify, message_id)
			let data = new DataView(usbTransferResult.data.buffer, payloadHeaderLength)
			return {
				command: command,
				message_id: message_id,
				data: data
			}
		} else {
			console.error(usbTransferResult.status, usbTransferResult)
		}
*/
	}

	async initialize()
	{
		let device = this.#device = await window.navigator.usb.requestDevice({
			filters: [{ vendorId: 0x16d0, productId: 0x0f9a}]
		})
		await device.open()
		await device.selectConfiguration(1)
		for (const index in device.configuration.interfaces) {
			let itf = device.configuration.interfaces[index]
			if (itf.alternate.interfaceClass == 0xFF) {
				await device.claimInterface(index)
				let endpoints = itf.alternate.endpoints
				let usbInterface = {
					index: index,
					interface: itf,
					epIn: null,
					epOut: null
				}
				endpoints.forEach(endpoint => {
					if (endpoint.direction === 'out') {
						usbInterface.epOut = endpoint
					} else if (endpoint.direction === 'in') {
						usbInterface.epIn = endpoint
					}
				})
				this.interfaces.push(usbInterface)
			}
		}
		for (const usbInterface of this.interfaces) {
			await this.sendState(usbInterface, 1)
			this.listen(usbInterface)
		}
		await this.setBaudrate(this.interfaces[0], 115200)
		return this.resetEsp32ToWebUSB(this.interfaces[0], 0x03)
	}

	bufferToString(buffer) {
		let bytes = new Uint8Array(buffer);
		return this.bytesToString(bytes)
	}
	
	bytesToString(bytes) {
		let string = bytes.reduce((prev, curr) => {
			prev+=' '+curr.toString(16)
			return prev
		},'')
		return string
	}

	#findMagicMarker(bytes) {
		// stupid code that should work
		let magic = [0x0d,0xf0,0xed,0xfe];
		let start = bytes.indexOf(magic[0]);
		while (start!==-1) {
			if (bytes.length<start+4) {
				return -1
			}
			if (bytes[start+1]===magic[1] && bytes[start+2]===magic[2] && bytes[start+3]===magic[3]) {
				console.log('magic',start,this.bytesToString(bytes.slice(start,start+4)))
				return start;
			}
			start = bytes.indexOf(magic[0], start+1)
		}			
		return -1 
	}
		
	async listen(usbInterface) {
		this.listening[usbInterface.index] = true //@FIXME: endpointnumber is incorrect, should be interface index
		let usbTransferResult
		let maxLength = 1000000
		let received = new Uint8Array(0)
		while(1) {
			usbTransferResult = await this.#device.transferIn(usbInterface.epIn.endpointNumber, maxLength)
			
			if (usbTransferResult.status === 'ok') {
				//console.log('bytestring',this.bufferToString(usbTransferResult.data.buffer))
				let bytes = new Uint8Array(usbTransferResult.data.buffer)
				let newReceived = new Uint8Array(received.length + bytes.length)
				newReceived.set(received)
				newReceived.set(bytes, received.length)
				received = newReceived
				let feedfood = false
				let start = false
				let magicPosition = this.#findMagicMarker(received)
				if (magicPosition!==-1) {
					console.log('magic found at '+magicPosition)
					start = magicPosition
					newReceived = new Uint8Array(received.length - start)
					newReceived.set(received.slice(start))
					received = newReceived
					console.log('received', this.bytesToString(received))
				}
				let header = false
				let packet = false
				if (start!==false) {
					if (received.length>headerLength) {
						console.log('jay')
						packet = WebUSBPacket.fromPacket(received.buffer)
						console.log('message header',packet)
					}
				}
				let message = false				
				if (packet && packet.data) {
					message = packet
					console.log('message',message)
					this.messages[message.message_id] = message
					received = received.slice(headerLength+message.data.length)
				}
				if (message && this.listeners[message.message_id]) {
					console.log(message.message_id+' found, calling')
					this.listeners[message.message_id](message)
				} else if (message) {
					console.log(message.message_id+' not found', Object.keys(this.listeners))
				}
			}
		}
	}
}


class mchBadgeAdapter 
{

	#path;
	#exceptionHandler;

	constructor(path, exceptionHandler=null, driver=null)
	{
		this.#path = path
		this.#exceptionHandler = exceptionHandler
		this.driver = driver
	}

	get name()
	{
		return 'mchBadgeAdapter'
	}

	get path()
	{
		return this.#path
	}

	supportsWrite()
	{
		return true
	}

	supportsStreamingWrite()
	{
		return false
	}

	supportsStreamingRead()
	{
		return false
	}

	#checkPath(path)
	{
		if (!jsfsPath.isPath(path)) {
			throw new TypeError(path+' is not a valid path')
		}
		if (!['appfs','flash','sdcard'].includes(jsfsPath.head(path))) {
			throw new TypeError(path+' must start with one of ["/appfs/","/flash/","/sdcard/"]')
		}
	}

	async #appfsList()
	{
		let data = await this.driver.sendPacket(this.driver.interfaces[0], new WebUSBPacket(APFSLIST))
		let num_apps = struct('<I').unpack(data.buffer)
		data = data.slice(4)
		let list = []
		for(let i=0;i<num_apps;i++) {
			let [appsize, lenname] = struct('<II').unpack(data.buffer)
			data = data.slice(8)
			let name = new TextDecoder().decode(data.slice(0,lenname));
			//let name = data.slice(0,lenname)
			data = data.slice(lenname)
			list.push({
				name: name,
				size: appsize
			})
		}
		return list
	}

	async #fslist(path)
	{
//		if (path[path.length-1] === '/') {
//			path = path.substring(0, path.length-1)
//		}
		let packet = new WebUSBPacket(GETDIR, new TextEncoder().encode(path))
		console.log(packet)
		let data = await this.driver.sendPacket(this.driver.interfaces[0], packet)
		console.log(data)
		data = new TextDecoder().decode(data)
		console.log(data)
		let list = data.split('\n')
		console.log(list)
		let result = {
			path: path,
			files: [],
			dirs: []
		}
		for (let line of list) {
			if (line[0]=='f') {
				result.files.push(line.substring(1))
			} else {
				result.dirs.push(line.substring(1))
			}
		}
		return result		
	}

	cd(path)
	{
		this.#checkPath(path)
		return new mchBadgeAdapter(path, this.#exceptionHandler)
	}

	async write(path, contents)
	{
		this.#checkPath(path)
	}

	async read(path)
	{
		this.#checkPath(path)

	}

	async exists(path)
	{
		this.#checkPath(path)

	}

	async delete(path)
	{
		this.#checkPath(path)

	}

	async list(path)
	{
		this.#checkPath(path)
		const root = jsfsPath.head(path)
		switch(root) {
			case 'appfs':
				return this.#appfsList()
			break;
			case 'flash':
			//fallthrough
			case 'sdcard':
				return this.#fslist(path)
			break;
			default: 
				throw new Error('Unknown filesystem')
			break;
		}
	}
}

export { mchBadgeAdapter, mchBadgeDriver }