import { writable, type Writable } from 'svelte/store'
import type {
  CollectionParams,
  Dictionary,
  DictionaryResponse,
} from '../../types/Dict'
import { dictService } from '../../services/dict.service'
import { error } from '@sveltejs/kit'

export const useDict: Writable<Dictionary> = writable({
  words: [],
  collectionName: '',
})

export const getNewWord = async (word: string) => {
  const result = await dictService.getWord(word)

  if (result instanceof Array) {
    addWord(
      result.map((value) => {
        return {
          ...value,
          phonetics:
            value.phonetics.length > 1
              ? value.phonetics.filter(
                  (value) => value.audio !== '' && value.text !== undefined
                )
              : value.phonetics,
        }
      })
    )

    return result
  } else {
    return error(404, result.title)
  }
}

export function addWord(data: DictionaryResponse[]) {
  useDict.update((value: Dictionary) => ({
    ...value,
    words: [...value.words, data],
  }))
}

export function remWord(wordIndex: number) {
  useDict.update((value: Dictionary) => ({
    ...value,
    words: value.words.filter((_, index) => index !== wordIndex),
  }))
}

export async function addNewCollection(
  collection: CollectionParams,
  userId: string
) {
  try {
    const wordsCollection = await dictService.addNewCollection(collection)

    await dictService.updateWordsCollections(wordsCollection.id, userId)

    return wordsCollection
  } catch (err) {
    console.log(err)
  }
}
