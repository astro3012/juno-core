import React, { useState } from 'react'
import {
  FiArchive,
  FiCheckCircle,
  FiCornerUpLeft,
  FiMoreHorizontal,
} from 'react-icons/fi'
import { useLocation } from 'react-router-dom'
import ArchiveMail from '../EmailOptions/ArchiveMail'
import EmailMoreOptions from '../EmailMoreOptions'
import * as S from './InlineThreadActionsStyles'
import * as todo from '../../constants/todoConstants'
import { CustomIconLink } from '../Elements/Buttons'
import ReplyOverview from '../EmailOptions/ReplyOverview'
import SetCompletedMail from '../EmailOptions/SetCompletedMail'
import SetToDoMail from '../EmailOptions/SetToDoMail'
import { FindLabelByName } from '../../utils'
import { selectStorageLabels } from '../../Store/labelsSlice'
import { useAppDispatch, useAppSelector } from '../../Store/hooks'
import { LocationObjectType } from '../types/globalTypes'

const InlineThreadActions = ({ id, history, labelIds }: { id: string, history: any, labelIds: string[] }) => {
  const [showMenu, setShowMenu] = useState<boolean>(false)
  const storageLabels = useAppSelector(selectStorageLabels)
  // const labelURL = convertArrayToString(labelIds)
  const dispatch = useAppDispatch()
  const location = useLocation<LocationObjectType>()
  const messageId = id && id

  return (
    <S.Wrapper>
      <S.Inner>
        <CustomIconLink
          className="button button-small text_muted option-link"
          icon={<FiCornerUpLeft />}
          onClick={() =>
            ReplyOverview({ history, labelIds, id, dispatch })
          }
        />
        {/* <CustomIconLink
          className="button button-small text_muted option-link"
          icon={<FiClock />}
        /> */}
        {labelIds &&
          labelIds.some(
            (item) =>
              item ===
              FindLabelByName({
                storageLabels,
                LABEL_NAME: todo.LABEL,
              })[0].id
          ) ? (
          <CustomIconLink
            onClick={() =>
              SetCompletedMail({
                messageId,
                history,
                labelIds,
                dispatch,
                location,
              })
            }
            className="button button-small text_muted option-link"
            icon={<FiCheckCircle />}
          />
        ) : (
          <CustomIconLink
            onClick={() =>
              SetToDoMail({
                history,
                messageId,
                labelIds,
                dispatch,
                location,
                storageLabels,
              })
            }
            className="button button-small text_muted option-link"
            icon={<FiCheckCircle />}
          />
        )}
        <CustomIconLink
          onClick={() =>
            ArchiveMail({ messageId, location, dispatch, labelIds })
          }
          className="button button-small text_muted option-link"
          icon={<FiArchive />}
        />
        <CustomIconLink
          onClick={() => setShowMenu(!showMenu)}
          className="button button-small text_muted option-link"
          icon={<FiMoreHorizontal />}
        />
      </S.Inner>
      {showMenu && <EmailMoreOptions messageId={id} labelIds={labelIds} />}
    </S.Wrapper>
  )
}

export default InlineThreadActions
