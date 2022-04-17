import { Pr0grammItem } from '@prisma/client';
import { DateTime } from 'luxon';
import { FilterFlagOpts as FilterFlagOpts, Settings } from './settings/settings';
import { MediaCollectionGroup } from './mediaCollectionGroup';
import { SystemService } from '../services/logic/systemService';

export class Pr0grammItemCollection {

    private readonly items: Pr0grammItem[];

    constructor(items: Pr0grammItem[]) {
        this.items = items;
    }

    filterByFlags(filterFlags: FilterFlagOpts) {
        if (filterFlags.sfw && filterFlags.nsfw && filterFlags.nsfl) {
            return this;
        }
        return new Pr0grammItemCollection(this.items.filter(el => Settings.filterFlagMatches(el.flags, filterFlags)));
    }

    filterByBenis(minBenis: number) {
        if (minBenis === 0) {
            return this;
        }
        return new Pr0grammItemCollection(this.items.filter(el => el.up - el.down > minBenis));
    }

    // Removes all ids that are provided
    removeIds(ids: number[]) {
        if (ids.length === 0) {
            return this;
        }
        return new Pr0grammItemCollection(this.items.filter(el => !ids.includes(el.id)));
    }

    filterNewerThan(date: DateTime) {
        return new Pr0grammItemCollection(this.items.filter(el => date.diff(DateTime.fromJSDate(el.createdAt), "seconds").seconds > 0));
    }

    toMediaCollectionGroup() {
        return MediaCollectionGroup.fromItems(this.items);
    }

    filterHighestBenis(amount: number) {
        // If no max amount is set or if it exceeds the environment configured amount
        // only take max amount of posts with highest benises nonetheless
        if (amount === 0 || amount > SystemService.getInstance().MAX_ITEM_AMOUNT) {
            amount = SystemService.getInstance().MAX_ITEM_AMOUNT
        }

        // Sort by benis
        const sortedByBenis = [...this.items].sort((a, b) => {
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

        return new Pr0grammItemCollection(sortedByAge);
    }

    get length() {
        return this.items.length;
    }
}