import jsfsPath from './jsfs/src/Path.js'

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