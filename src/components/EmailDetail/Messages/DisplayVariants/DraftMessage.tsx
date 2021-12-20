import React from 'react'
import EmailAvatar from '../../../Elements/Avatar/EmailAvatar'
import TimeStamp from '../../../Elements/TimeStamp/TimeStampDisplay'
import { openDraftEmail } from '../../../../Store/draftsSlice'
import * as local from '../../../../constants/draftConstants'
import * as S from '../../EmailDetailStyles'
import { selectCurrentEmail } from '../../../../Store/emailDetailSlice'
import { useAppDispatch, useAppSelector } from '../../../../Store/hooks'
import { EmailMessage } from '../../../../Store/emailListTypes'
import SenderNameFull from '../../../Elements/SenderName/senderNameFull'
import SenderNamePartial from '../../../Elements/SenderName/senderNamePartial'

const DraftMessage = ({ message }: { message: EmailMessage }) => {
  const dispatch = useAppDispatch()
  const id = useAppSelector(selectCurrentEmail)
  const messageId = message && message.id

  const EmailSnippet = message && `${ message.snippet.replace(/^(.{65}[^\s]*).*/, '$1') }...`

  const staticSenderNameFull = SenderNameFull(message)
  const staticSenderNamePartial = SenderNamePartial(message)

  const handleClick = () => {
    dispatch(openDraftEmail({ id, messageId }))
  }

  return (
    <S.EmailClosedWrapper onClick={handleClick} aria-hidden="true">
      <S.ClosedMessageWrapper>
        <S.TopContainer>
          <S.ClosedAvatarSender>
            <EmailAvatar avatarURL={staticSenderNameFull} />
            <S.ClosedSender>
              <span style={{ fontStyle: 'italic' }} title={staticSenderNamePartial.emailAddress}>{staticSenderNamePartial.name}</span>
            </S.ClosedSender>
          </S.ClosedAvatarSender>
        </S.TopContainer>
        <S.ClosedSnippet>
          <span style={{ fontWeight: 'bold' }}>{local.DRAFT_SNIPPET_INDICATOR}</span>
          <span style={{ fontStyle: 'italic' }}>{EmailSnippet}</span>
        </S.ClosedSnippet>
        <S.TimeAttachmentContainer>
          <TimeStamp threadTimeStamp={message.internalDate} />
        </S.TimeAttachmentContainer>
      </S.ClosedMessageWrapper>
    </S.EmailClosedWrapper>
  )
}

export default DraftMessage
