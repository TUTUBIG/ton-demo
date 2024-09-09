import {Address, beginCell, Cell, Contract} from '@ton/core';
import {crc32str} from "./crc32";

export type PacketType =
    Single
    | MultipleFixed
    | MultipleRandom

export interface Single {
    op: "single",
}

export interface MultipleFixed {
    op: "multipleFixed",
    totalPack: number | bigint,
}

export interface MultipleRandom {
    op: "multipleRandom",
    totalPack: number | bigint,
}


export class Params implements Contract {
    static readonly Opcodes = {
        create: crc32str(`op::router::create`),
    };
    public static readonly PacketTypeOp = {
        single: 1,
        multipleFixed: 2,
        multipleRandom: 3,
    };

    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {
    }

    public static composeCreatePayload(
        packetData: PacketType
    ) {

        let packetTypeOp = Params.PacketTypeOp[packetData.op]
        let redPacketInit = null;
        if (packetData.op == `single`) {
            redPacketInit = beginCell().endCell()
        } else if (packetData.op == "multipleFixed") {
            redPacketInit = beginCell().storeUint(packetData.totalPack, 16).endCell()
        } else {
            redPacketInit = beginCell().storeUint(packetData.totalPack, 16).endCell()
        }

        return beginCell()
            .storeUint(packetTypeOp, 8)
            .storeRef(redPacketInit)
            .endCell()
    }
}
