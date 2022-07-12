import { useEffect, useState } from 'react'
import ReactHtmlParser from 'react-html-parser'
import { useAppDispatch } from '../../../../store/hooks'
import { IEmailMessagePayload } from '../../../../store/storeTypes/emailListTypes'
import bodyDecoder from '../../../../utils/bodyDecoder'
import openLinkInNewTab from '../../../../utils/openLinkInNewTab'
import cleanLink from '../../../../utils/cleanLink'
import handleEmailLink from '../../../../utils/handleEmailLink'
import fetchUnsubscribeLink from '../../../../utils/fetchUnsubscribeLink'
import StyledCircularProgress from '../../../Elements/StyledCircularProgress'
import Wrapper from './EmailDetailBodyStyles'

interface IEmailDetailBody {
  threadDetailBody: IEmailMessagePayload
  messageId: string
  detailBodyCSS: 'visible' | 'invisible'
  setUnsubscribeLink?: Function
  setContentRendered?: (value: boolean) => void
  setBlockedTrackers?: (value: Attr[] | []) => void
}

let hasRan = false

const postTreatmentBody = ({
  dispatch,
  setUnsubscribeLink,
}: {
  dispatch: Function
  setUnsubscribeLink: Function
}) => {
  openLinkInNewTab()
  handleEmailLink({ dispatch })
  cleanLink()
  fetchUnsubscribeLink({ setUnsubscribeLink })
  hasRan = true
}

const EmailDetailBody = ({
  threadDetailBody,
  messageId,
  detailBodyCSS,
  setUnsubscribeLink,
  setContentRendered,
  setBlockedTrackers,
}: IEmailDetailBody) => {
  const [bodyState, setBodyState] = useState<null | {
    emailHTML: string
    emailFileHTML: any[]
    removedTrackers: Attr[] | []
  }>(null)
  const dispatch = useAppDispatch()
  const [isDecoding, setIsDecoding] = useState(true)

  useEffect(() => {
    hasRan = false
  }, [window.location])

  useEffect(() => {
    let mounted = true
    const controller = new AbortController()
    const { signal } = controller
    if (messageId.length > 0) {
      if (mounted && !hasRan) {
        const decoding = async () => {
          try {
            const bodyResponse = await bodyDecoder({
              messageId,
              inputObject: threadDetailBody,
              decodeImage: true,
              signal,
            })
            mounted && setBodyState(bodyResponse)
            if (setContentRendered && mounted) {
              setContentRendered(true)
            }
            if (setBlockedTrackers && bodyResponse.removedTrackers && mounted) {
              setBlockedTrackers(bodyResponse.removedTrackers)
            }
            mounted && setIsDecoding(false)
          } catch (err) {
            if (setContentRendered) {
              setContentRendered(true)
              setBodyState({
                emailHTML: '<p>Something went wrong during the decoding</p>',
                emailFileHTML: [],
                removedTrackers: [],
              })
            }
          }
        }
        decoding()
      }
    }
    return () => {
      mounted = false
      if (isDecoding) {
        controller.abort()
      }
    }
  }, [messageId, isDecoding])

  useEffect(() => {
    if (
      !isDecoding &&
      setUnsubscribeLink &&
      !hasRan &&
      detailBodyCSS === 'visible'
    ) {
      postTreatmentBody({ dispatch, setUnsubscribeLink })
    }
  }, [isDecoding, hasRan, setUnsubscribeLink, detailBodyCSS])

  return (
    <div className={detailBodyCSS}>
      {isDecoding && (
        <Wrapper>
          <StyledCircularProgress size={20} />
        </Wrapper>
      )}
      {!isDecoding &&
        bodyState?.emailHTML &&
        bodyState.emailHTML.length > 0 && (
          <div>{ReactHtmlParser(bodyState.emailHTML)}</div>
        )}
      {!isDecoding &&
        bodyState?.emailFileHTML &&
        bodyState.emailFileHTML.length > 0 &&
        bodyState.emailFileHTML.map(
          (item, itemIdx) =>
            Object.prototype.hasOwnProperty.call(item, 'mimeType') &&
            Object.prototype.hasOwnProperty.call(item, 'decodedB64') && (
              <img
                key={`${item.filename + itemIdx}`}
                src={`data:${item.mimeType};base64,${item.decodedB64}`}
                alt={item?.filename ?? 'embedded image'}
                style={{ maxWidth: '100%', borderRadius: '5px' }}
              />
            )
        )}
    </div>
  )
}

EmailDetailBody.defaultProps = {
  setUnsubscribeLink: null,
  setContentRendered: null,
  setBlockedTrackers: null,
}

export default EmailDetailBody
