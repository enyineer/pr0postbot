import { Pr0grammItem } from '@prisma/client';
import { DateTime } from 'luxon';
import { FilterFlags } from '../../bot/settings/settings';

export const createFakeItem = (opts: {
    audio?: boolean,
    created?: DateTime,
    createdAt?: DateTime,
    down?: number,
    flags?: FilterFlags,
    fullsize?: string,
    gift?: number,
    height: number,
    id: number,
    image: string
    mark?: number,
    promoted: number,
    source?: string,
    thumb: string,
    up?: number,
    updatedAt?: DateTime,
    user: string,
    userId: number,
    width: number
}): Pr0grammItem => {
    return {
        audio: opts.audio || false,
        created: opts.created?.toSeconds() || DateTime.now().toSeconds(),
        createdAt: opts.createdAt?.toJSDate() || DateTime.now().toJSDate(),
        down: opts.down || 0,
        flags: opts.flags || FilterFlags.SFW,
        fullsize: opts.fullsize || "",
        gift: opts.gift || 0,
        height: opts.height,
        id: opts.id,
        image: opts.image,
        mark: opts.mark || 1,
        promoted: opts.promoted,
        source: opts.source || "",
        thumb: opts.thumb,
        up: opts.up || 0,
        updatedAt: opts.updatedAt?.toJSDate() || DateTime.now().toJSDate(),
        user: opts.user,
        userId: opts.userId,
        width: opts.width
    }
}

const createdAt = DateTime.now();

export const getSfwVideo = () => createFakeItem({
    height: 1080,
    id: 5111424,
    image: "2022/04/17/586dc6be51b07275.mp4",
    promoted: 744455,
    thumb: "2022/04/17/586dc6be51b07275.jpg",
    user: "Vaginerboi",
    userId: 3555612,
    width: 1920,
    up: 100,
    flags: 1,
    createdAt,
    updatedAt: createdAt,
    created: createdAt
});

export const getSfwImage = () => createFakeItem({
    height: 769,
    id: 5111420,
    image: "2022/04/17/76b4910ec174aecf.jpg",
    promoted: 744453,
    thumb: "2022/04/17/76b4910ec174aecf.jpg",
    user: "P0ryg0n",
    userId: 370896,
    width: 1024,
    up: 200,
    flags: 1,
    createdAt,
    updatedAt: createdAt,
    created: createdAt
});

export const getNsfpVideo = () => createFakeItem({
    height: 258,
    id: 5111311,
    image: "2022/04/17/769cd821e7f5ca39.mp4",
    promoted: 744432,
    thumb: "2022/04/17/769cd821e7f5ca39.jpg",
    user: "gornogon",
    userId: 220961,
    width: 460,
    up: 300,
    flags: 8,
    createdAt,
    updatedAt: createdAt,
    created: createdAt
});

export const getNsfpImage = () => createFakeItem({
    height: 858,
    id: 5111299,
    image: "2022/04/17/222ee88aceed95b4.jpg",
    promoted: 744451,
    thumb: "2022/04/17/222ee88aceed95b4.jpg",
    user: "buryong",
    userId: 455184,
    width: 1080,
    up: 400,
    flags: 8,
    createdAt,
    updatedAt: createdAt,
    created: createdAt
});

export const getNsfwVideo = () => createFakeItem({
    height: 480,
    id: 5111308,
    image: "2022/04/17/692c9a19af18d3e8.mp4",
    promoted: 744431,
    thumb: "2022/04/17/692c9a19af18d3e8.jpg",
    user: "Twerkingclasshero",
    userId: 392644,
    width: 854,
    up: 500,
    flags: 2,
    createdAt,
    updatedAt: createdAt,
    created: createdAt
});

export const getNsfwImage = () => createFakeItem({
    height: 1403,
    id: 5111317,
    image: "2022/04/17/3576a05fac929d6d.jpg",
    promoted: 744433,
    thumb: "2022/04/17/3576a05fac929d6d.jpg",
    user: "PascallusMitDemLangenPhallus",
    userId: 141413,
    width: 1052,
    up: 600,
    flags: 2,
    createdAt,
    updatedAt: createdAt,
    created: createdAt
});

export const getNsflVideo = () => createFakeItem({
    height: 368,
    id: 5109820,
    image: "2022/04/16/6c7544e388392848.mp4",
    promoted: 744174,
    thumb: "2022/04/16/6c7544e388392848.jpg",
    user: "Jetn0stril",
    userId: 413246,
    width: 640,
    up: 800,
    flags: 4,
    createdAt,
    updatedAt: createdAt,
    created: createdAt
});

export const getNsflImage = () => createFakeItem({
    height: 1488,
    id: 5111177,
    image: "2022/04/17/c77d76459a884bda.jpg",
    promoted: 744428,
    thumb: "2022/04/17/c77d76459a884bda.jpg",
    user: "Schlauchk0mb0",
    userId: 413619,
    width: 1125,
    up: 900,
    flags: 4,
    createdAt,
    updatedAt: createdAt,
    created: createdAt
});