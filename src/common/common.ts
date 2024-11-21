let NAME = 'Tech Editor';

export default NAME;

export type StoreData = {
    id?: string
    title: string
    date: number
    data: string
}

export type CategoryTree = {
    id: string
    title: string
    date: number
    parentId?: string
    children: CategoryTree[]
    postIds: string[]
}
