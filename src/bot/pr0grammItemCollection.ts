import { Pr0grammItem } from '@prisma/client';
import { DateTime } from 'luxon';
import { FilterFlagOpts as FilterFlagOpts, Settings } from './settings/settings';
import { MediaCollectionGroup } from './mediaCollectionGroup';
import { SystemService } from '../services/logic/systemService';
import { Logger } from '../logger/logger';

export class Pr0grammItemCollection {

    private readonly _items: Pr0grammItem[];

    constructor(items: Pr0grammItem[]) {
        this._items = items;
    }

    filterByFlags(filterFlags: FilterFlagOpts) {
        Logger.i.debug(`Before filterByFlags: ${this.items.length}`);
        if (filterFlags.sfw && filterFlags.nsfw && filterFlags.nsfl) {
            Logger.i.debug(`Filter not applied.`);
            return this;
        }
        const newCollection = new Pr0grammItemCollection(this._items.filter(el => Settings.filterFlagMatches(el.flags, filterFlags)));
        Logger.i.debug(`After filterByFlags: ${this.items.length}`);
        return newCollection;
    }

    filterByBenis(minBenis: number) {
        Logger.i.debug(`Before filterByBenis: ${this.items.length}`);
        if (minBenis === 0) {
            Logger.i.debug(`Filter not applied.`);
            return this;
        }
        const newCollection = new Pr0grammItemCollection(this._items.filter(el => el.up - el.down >= minBenis));
        Logger.i.debug(`After filterByBenis: ${this.items.length}`);
        return newCollection;
    }

    // Removes all ids that are provided
    removeIds(ids: number[]) {
        Logger.i.debug(`Before removeIds: ${this.items.length}`);
        if (ids.length === 0) {
            Logger.i.debug(`Filter not applied.`);
            return this;
        }
        const newCollection = new Pr0grammItemCollection(this._items.filter(el => !ids.includes(el.id)));
        Logger.i.debug(`After removeIds: ${this.items.length}`);
        return newCollection;
    }

    filterNewerThan(date: DateTime) {
        Logger.i.debug(`Before filterNewerThan: ${this.items.length}`);
        const newCollection = new Pr0grammItemCollection(this._items.filter(el => date.diff(DateTime.fromJSDate(el.createdAt), "seconds").seconds > 0));
        Logger.i.debug(`After filterNewerThan: ${this.items.length}`);
        return newCollection;
    }

    toMediaCollectionGroup() {
        return MediaCollectionGroup.fromItems(this._items);
    }

    filterHighestBenis(amount: number) {
        Logger.i.debug(`Before filterHighestBenis: ${this.items.length}`);
        // If no max amount is set or if it exceeds the environment configured amount
        // only take max amount of posts with highest benises nonetheless
        if (amount === 0 || amount > SystemService.getInstance().MAX_ITEM_AMOUNT) {
            amount = SystemService.getInstance().MAX_ITEM_AMOUNT
        }

        // Sort by benis
        const sortedByBenis = [...this._items].sort((a, b) => {
            const aBenis = a.up - a.down;
            const bBenis = b.up - b.down;
            if (aBenis > bBenis) {
                return -1;
            }
            if (aBenis < bBenis) {
                return 1;
            }
            return 0;
        });

        // Slice out the specified amount of items (posts with highest benises)
        const sliced = sortedByBenis.slice(0, amount);

        // Sort highest rated posts by promoted id if set, else by date
        const sortedByAge = [...sliced].sort((a, b) => {
            if (a.promoted > 0 && b.promoted > 0) {
                // Sort by promoted id
                if (a.promoted > b.promoted) {
                    return -1;
                }
                if (a.promoted < b.promoted) {
                    return 1;
                }
                return 0;
            } else {
                // Sort by created date
                if (a.created > b.created) {
                    return -1;
                }
                if (a.created < b.created) {
                    return 1;
                }
                return 0;
            }
        })

        const newCollection = new Pr0grammItemCollection(sortedByAge);
        Logger.i.debug(`After filterHighestBenis: ${this.items.length}`);
        return newCollection;
    }

    get length() {
        return this._items.length;
    }

    get items(): Pr0grammItem[] {
        return this._items;
    }
}