import { Pr0grammItem } from '../services/pr0grammService';
import { FilterOpts, Filters } from './filters';
import { MediaCollectionGroup } from './mediaCollectionGroup';

export class Update {

    private readonly items: Pr0grammItem[];

    constructor(items: Pr0grammItem[]) {
        this.items = items;
    }

    filter(filters: FilterOpts) {
        return new Update(this.items.filter(el => Filters.filterMatches(el.flags, filters)));
    }

    toMediaCollectionGroup() {
        return MediaCollectionGroup.fromItems(this.items);
    }

}