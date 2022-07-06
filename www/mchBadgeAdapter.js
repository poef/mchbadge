import jsfsPath from './jsfs/src/Path.js'
import struct from './structjs/struct.mjs'

let messageIds = 0

const APFSLIST = 4103

const verification = 0xADDE
const payloadHeaderLength = 12


class WebUSBPacket
{
	
	constructor(command, payload=null) 
	{
		this.command = command
		this.payload = payload ? payload : ""
		this.message_id = messageIds++
	}

	getMessage()
	{
		return struct.pack("<HIHI", this.command.value, this.payload.length, 0xADDE)
	}
}

export class mchBadgeDriver
{
	#device
	#interfaces = []
	#bitstream_state=false
	#bitstream_process_state = 0

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
			await this.setBaudrate(usbInterface, 912600)
			await this.wait(50)
			await this.setBaudrate(usbInterface, 912600)
			await this.setBitstreamMode(webusb_mode==0x02)
		}
	}

	async sendPacket(usbInterface, packet, transfersize=2048)
	{
		let msg = packet.getMessage()
		let chunks = msg.match(/.{1,transfersize}/g)
		for (let chunk of chunks) {
			await this.#device.transferOut(usbInterface.endpointNumber, chunk)
			await this.wait(50)
		}		
		let response = await this.receiveResponse(usbInterface)
		if (response.message_id!== packet.message_id) {
			throw new Error('response id '+response.message_id+' does not match packet id '+packet.message_id)
		}
		if (response.command!==packet.command.value) {
			throw new Error('response command '+response.command+' does not match packet '+packet.command.value)
		}
		return response.data

	}

	async receiveResponse(usbInterface)
	{
		let maxLength = 1048576 //1MB for now
		let usbTransferResult = await this.#device.transferIn(usbInterface.endpointNumber, maxLength)
		if (usbTransferResult.status === 'ok') {
			let unpacked = struct.unpack_from('<HIHI', usbTransferResult.data.buffer)
			console.log(unpacked)
		} else {
			console.error(usbTransferResult.status, usbTransferResult)
		}
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
				this.#interfaces.push(usbInterface)
			}
		}
		for (const usbInterface of this.#interfaces) {
			await this.sendState(usbInterface, 1)
//			await this.listen(usbInterface)
		}
		await this.setBaudrate(this.#interfaces[0], 115200)
		await this.setBaudrate(this.#interfaces[1], 1000000)
		return this.resetEsp32ToWebUSB(this.#interfaces[0], 0x01)
	}

}


export default class mchBadgeAdapter 
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
		let data = await this.driver.sendPacket(new WebUSBPacket(APFSLIST))
		let num_apps = struct.unpack_from("<I", data)
		data = data.slice(4)
		let list = []
		for(let i=0;i<num_apps;i++) {
			//@TODO continue here
		}
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
			break;
		}
	}
}