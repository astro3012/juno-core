import { useCallback } from 'react'

import * as keyConstants from '../../../constants/keyConstants'
import useMultiKeyPress from '../../../hooks/useMultiKeyPress'
import { QiMailUnsub } from '../../../images/svgIcons/quillIcons'
import { useAppSelector } from '../../../store/hooks'
import { selectInSearch } from '../../../store/utilsSlice'
import createComposeViaURL from '../../../utils/createComposeViaURL'
import { setModifierKey } from '../../../utils/setModifierKey'
import CustomButton from '../../Elements/Buttons/CustomButton'
import * as global from '../../../constants/globalConstants'
import {
  selectCoreStatus,
  setCoreStatus,
} from '../../../store/emailDetailSlice'

import type { AppDispatch } from '../../../store/store'

const handleUnsubscribe = ({
  coreStatus,
  dispatch,
  unsubscribeLink,
}: {
  dispatch: AppDispatch
  coreStatus: string | null
  unsubscribeLink: string
}) => {
  if (unsubscribeLink.includes('mailto:')) {
    if (
      coreStatus === global.CORE_STATUS_MAP.focused ||
      coreStatus === global.CORE_STATUS_MAP.sorting
    ) {
      dispatch(setCoreStatus(null))
    }
    createComposeViaURL({ dispatch, mailToLink: unsubscribeLink })
  } else {
    window.open(unsubscribeLink)
  }
}

const actionKeys = [setModifierKey, keyConstants.KEY_SHIFT, keyConstants.KEY_U]
const UNSUBSCRIBE = 'Unsubscribe'

const UnsubscribeOption = ({
  dispatch,
  unsubscribeLink,
  iconSize,
}: {
  dispatch: AppDispatch
  unsubscribeLink: string
  iconSize: number
}) => {
  const inSearch = useAppSelector(selectInSearch)
  const coreStatus = useAppSelector(selectCoreStatus)

  const handleEvent = useCallback(() => {
    handleUnsubscribe({ unsubscribeLink, dispatch, coreStatus })
  }, [unsubscribeLink])

  useMultiKeyPress(handleEvent, actionKeys, inSearch)

  return (
    <CustomButton
      icon={<QiMailUnsub size={iconSize} />}
      label={UNSUBSCRIBE}
      onClick={handleEvent}
      suppressed
      title="Unsubscribe"
    />
  )
}

export default UnsubscribeOption
