/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit'

import { SETTINGS_DELIMITER, SETTINGS_LABEL } from '../constants/baseConstants'
import { getLabelByRoute } from '../constants/labelMapConstant'
import labelApi from '../data/labelApi'
import { fetchEmailsSimple } from './emailListSlice'
import { GoogleLabel, LabelIdName, LabelState } from './storeTypes/labelsTypes'
import { setSettingsLabelId, setSystemStatusUpdate } from './utilsSlice'

import type { AppThunk, RootState } from './store'

const initialState: LabelState = Object.freeze({
  labelIds: [],
  loadedInbox: [],
  storageLabels: [],
})

export const labelsSlice = createSlice({
  name: 'labels',
  initialState,
  reducers: {
    setCurrentLabels: (state, { payload }) => {
      state.labelIds = payload
    },
    setLoadedInbox: (state, { payload }) => {
      state.loadedInbox = [...new Set([...state.loadedInbox, payload])]
    },
    setStorageLabels: (state, { payload }) => {
      if (!Array.isArray(payload)) {
        const labelIdName: LabelIdName = {
          id: payload.id,
          name: payload.name,
        }
        state.storageLabels = [...state.storageLabels, labelIdName]
      }
      if (Array.isArray(payload)) {
        const labelIdNameArray = payload.map((label: GoogleLabel[]) => ({
          id: label[0]?.id,
          name: label[0]?.name,
        }))
        state.storageLabels = [...state.storageLabels, ...labelIdNameArray]
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      fetchEmailsSimple.fulfilled,
      (state, { payload: { labels } }) => {
        if (labels) {
          state.loadedInbox = [...state.loadedInbox, ...labels]
        }
      }
    )
  },
})

export const { setCurrentLabels, setLoadedInbox, setStorageLabels } =
  labelsSlice.actions

export const createLabel =
  (label: string): AppThunk =>
  async (dispatch) => {
    try {
      const body =
        typeof label === 'string'
          ? {
              name: label,
              labelVisibility: 'labelShow',
              messageListVisibility: 'show',
            }
          : label
      const response = await labelApi().createLabel(body)

      if (response?.status === 200) {
        dispatch(setStorageLabels(response.data))
        if (
          response?.data?.data?.name.startsWith(
            `${SETTINGS_LABEL + SETTINGS_DELIMITER}`
          )
        ) {
          dispatch(setSettingsLabelId(response.data.data.id))
        }
      } else {
        dispatch(
          setSystemStatusUpdate({
            type: 'error',
            message: 'Unable to create the label.',
          })
        )
      }
    } catch (err) {
      dispatch(
        setSystemStatusUpdate({
          type: 'error',
          message: 'Unable to create the label.',
        })
      )
    }
    return null
  }

export const removeLabel =
  (labelId: string): AppThunk =>
  async (dispatch) => {
    try {
      const response = await labelApi().deleteLabel(labelId)
      if (response?.status !== 204) {
        dispatch(
          setSystemStatusUpdate({
            type: 'error',
            message: 'Unable to remove the label.',
          })
        )
      }
    } catch (err) {
      dispatch(
        setSystemStatusUpdate({
          type: 'error',
          message: 'Unable to remove the label.',
        })
      )
    }
    return null
  }

export const fetchLabelIds =
  (LABEL: string): AppThunk =>
  async (dispatch) => {
    try {
      const { labels } = await labelApi().fetchLabels()
      if (labels) {
        const labelObject = labels.filter(
          (label: LabelIdName) => label.name === LABEL
        )
        if (labelObject.length > 0) {
          dispatch(setCurrentLabels([labelObject[0].id]))
          dispatch(setStorageLabels([labelObject[0].id]))
        } else {
          dispatch(
            setSystemStatusUpdate({
              type: 'error',
              message: 'Unable to fetch the label.',
            })
          )
        }
      } else {
        dispatch(
          setSystemStatusUpdate({
            type: 'error',
            message: 'Unable to fetch the label.',
          })
        )
      }
    } catch (err) {
      dispatch(
        setSystemStatusUpdate({
          type: 'error',
          message: 'Unable to fetch the label.',
        })
      )
    }
  }

export const setCurrentLabel = (): AppThunk => (dispatch, getState) => {
  const activePath = getState().router.location?.pathname
  const { storageLabels } = getState().labels

  if (activePath) {
    const currentLabelName = getLabelByRoute[activePath]
    const labelObject = storageLabels.find(
      (label) => label.name === currentLabelName
    )
    if (labelObject) {
      dispatch(setCurrentLabels([labelObject.id]))
    } else {
      dispatch(
        setSystemStatusUpdate({
          type: 'error',
          message: 'Unable to set current label - label is not found.',
        })
      )
    }
  } else {
    dispatch(
      setSystemStatusUpdate({
        type: 'error',
        message: 'Error getting the current location',
      })
    )
  }
}

export const selectLabelIds = (state: RootState) => state.labels.labelIds
export const selectLoadedInbox = (state: RootState) => state.labels.loadedInbox
export const selectStorageLabels = (state: RootState) =>
  state.labels.storageLabels

export default labelsSlice.reducer
