import jsfsPath from './jsfs/src/Path.js'

export default class mchBadgeAdapter 
{

	#path;
	#exceptionHandler;
	#device;
	#interfaces;
	#bitstream_state=false;
	#bitstream_process_state = 0;

	constructor(path, exceptionHandler=null)
	{
		this.#path = path
		this.#exceptionHandler = exceptionHandler
	}

	async initialize()
	{
		this.#device = await nagivator.usb.requestDevice({
			filters: [{ vendorId: 0x16d0, productId: 0x0f9a}]
		})
		await device.open()
		await device.selectConfiguration(1)
		device.configuration.interfaces.forEach( async (itf, index) => {
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
		})
		this.#interfaces.forEach(async usbInterface => {
			await this.#sendState(usbInterface, 1)
			await this.#listen(usbInterface)
		})
		await this.#setBaudrate(1, 115200)
		await this.#setBaudrate(2, 1000000)
		return this.#resetEsp32ToWebUSB(this.#interfaces[1], 0x00)
	}

	async #sendControl(usbInterface, request, value)
	{
		let endpoint = usbInterface.epout
		return this.#device.controlTransferOut({
			requestType: 'class',
			recipient: 'interface',
			request: request,
			value: value,
			index: usbInterface.index
		})
	}

	async #sendState(usbInterface, state)
	{
		return this.#sendControl(usbInterface, 0x22, state)
	}

	async #resetEsp32(usbInterface, bootloader_mode = false)
	{
		return this.#sendControl(usbInterface, 0x23, bootloader_mode ? 0x01 : 0x00)
	}

	async #setBaudrate(usbInterface, baudrate)
	{
		return this.#sendControl(usbInterface, 0x24, Math.floor(baudrate/100))
	}

	async #setMode(usbInterface, mode)
	{
		return this.#sendControl(usbInterface, 0x25, mode)
	}

	async #listen(usbInterface)
	{

	}

	#setBitstreamMode(mode) {
		this.#bitstream_state = mode
	}

	async #wait(time)
	{
		return new Promise(r => setTimeout(r, time))
	}

	async #resetEsp32ToWebUSB(usbInterface, webusb_mode = 0x00)
	{
		await this.#setMode(usbInterface, webusb_mode)
		await this.#wait(50)
		await this.#resetEsp32(usbInterface, false)
		await this.#wait(50)
		await this.#setBaudrate(usbInterface, 115200)
		await this.#wait(50)
		this.#setBitstreamMode(0)
		if (webusb_mode>0) {
			await this.#wait(3000)
			await this.#setBaudrate(usbInterface, 912600)
			await this.#wait(50)
			await this.#setBaudrate(usbInterface, 912600)
			await this.#setBitstreamMode(webusb_mode==0x02)
		}
	}

	#sendPacket(packet, transfersize=2048)
	{

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
		if (!['appfs','flash','sdcard'].contains(jsfsPath.head(path))) {
			throw new TypeError(path+' must start with one of ["/appfs/","/flash/","/sdcard/"]')
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

	}
}