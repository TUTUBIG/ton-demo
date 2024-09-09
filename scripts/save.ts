import * as fs from "fs";
import * as path from "path";
import {NetworkProvider} from "@ton/blueprint";

export async function saveToFile(obj: Record<string, any>, name: string, upgrade: boolean, provider: NetworkProvider) {
    if (name === null || name === undefined || name.length === 0) {
        name = ''
    }

    let deploymentsDirName = 'deployments'

    if (!fs.existsSync(path.resolve(deploymentsDirName))) {
        fs.mkdirSync(path.resolve(deploymentsDirName), 0o777)
    }

    let networkName = provider.network()

    if (!fs.existsSync(path.resolve(deploymentsDirName, networkName))) {
        fs.mkdirSync(path.resolve(deploymentsDirName, networkName), 0o777)
    }

    let savePath
    if (upgrade) {
        savePath = path.resolve(deploymentsDirName, networkName, `upgrade`)
    } else {
        savePath = path.resolve(deploymentsDirName, networkName, `deploy`)
    }

    if (!fs.existsSync(savePath)) {
        fs.mkdirSync(savePath, 0o777)
    }

    let fileNameStrings=[name,networkName,new Date().getTime(),`json`]

    let fileName = fileNameStrings.join(`.`)

    fs.writeFileSync(
        path.resolve(savePath, fileName),
        JSON.stringify(obj, null, 2),
        {flag: 'w'}
    )
}
