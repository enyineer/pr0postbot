import { Pr0grammItem } from '@prisma/client';
import { Pr0grammItemCollection } from '../bot/pr0grammItemCollection';
import { getNsflImage, getNsflVideo, getNsfpImage, getNsfpVideo, getNsfwImage, getNsfwVideo, getSfwImage, getSfwVideo } from './fixtures/pr0grammItem';

const items: Pr0grammItem[] = [
    getSfwImage(),
    getSfwVideo(),
    getNsfpImage(),
    getNsfpVideo(),
    getNsfwImage(),
    getNsfwVideo(),
    getNsflImage(),
    getNsflVideo(),
]

const collection = new Pr0grammItemCollection(items);

test('filters for sfw', () => {
    const sfwCollection = collection.filterByFlags({ sfw: true, nsfw: false, nsfl: false });
    expect(sfwCollection.items).toEqual([getSfwImage(), getSfwVideo(), getNsfpImage(), getNsfpVideo()]);
});

test('filters for nsfw', () => {
    const nsfwCollection = collection.filterByFlags({ sfw: false, nsfw: true, nsfl: false });
    expect(nsfwCollection.items).toEqual([getNsfwImage(), getNsfwVideo()]);
});

test('filters for nsfl', () => {
    const nsflCollection = collection.filterByFlags({ sfw: false, nsfw: false, nsfl: true });
    expect(nsflCollection.items).toEqual([getNsflImage(), getNsflVideo()]);
});

test('filter by benis', () => {
    const minBenis = 500;
    const matchingItems = items.filter(el => el.up - el.down >= minBenis);
    const benisCollection = collection.filterByBenis(minBenis);
    expect(benisCollection.items).toEqual(matchingItems);
});

test('filter removed ids', () => {
    const filterIds = [getSfwImage().id, getNsfwImage().id];
    const filteredItems = items.filter(el => !filterIds.includes(el.id));
    const idCollection = collection.removeIds(filterIds);
    expect(idCollection.items).toEqual(filteredItems);
});

test('filter by highest benis', () => {
    const highestBenisCollection = collection.filterHighestBenis(1);
    expect(highestBenisCollection.items).toEqual([getNsflImage()]);
});

test('mediaCollection contains all items', () => {
    const mediaCollection = collection.toMediaCollectionGroup();
    expect(mediaCollection.audios.collection.length).toEqual(0);
    expect(mediaCollection.documents.collection.length).toEqual(0);
    expect(mediaCollection.photosAndVideos.collection.length).toEqual(items.length);
});

test('mediaCollection contains all items with large image as document', () => {
    const largeSfwImage = getSfwImage();
    largeSfwImage.width = 100;
    largeSfwImage.height = 2000;
    const collectionWithLargeSfwImage = new Pr0grammItemCollection([...items, largeSfwImage]);
    const mediaCollection = collectionWithLargeSfwImage.toMediaCollectionGroup();
    expect(mediaCollection.audios.collection.length).toEqual(0);
    expect(mediaCollection.documents.collection.length).toEqual(1);
    expect(mediaCollection.photosAndVideos.collection.length).toEqual(items.length);
});
