import { useState } from 'react'
import { FiCheck } from 'react-icons/fi'

import Botpoison from '@botpoison/browser'
import { useFormspark } from '@formspark/use-formspark'

import { QiLinkOut } from '../../../images/svgIcons/quillIcons'
import * as GS from '../../../styles/globalStyles'
import assertNonNullish from '../../../utils/assertNonNullish'
import CustomModal from '../../Elements/Modal/CustomModal'
import StyledCircularProgress from '../../Elements/StyledCircularProgress'
import * as S from './BetaAccessFormStyles'

if (process.env.NODE_ENV === 'production') {
  assertNonNullish(
    import.meta.env.VITE_BOTPOISON_PUBLIC_KEY,
    'Botpoison PK not found'
  )
}
const botpoison = new Botpoison({
  publicKey: import.meta.env.VITE_BOTPOISON_PUBLIC_KEY ?? '',
})

const FORMSPARK_FORM_ID = import.meta.env.VITE_FORMSPARK_FORM_ID

const BetaAccesForm = ({
  betaFormOpen,
  setBetaFormOpen,
}: {
  betaFormOpen: boolean
  setBetaFormOpen: (value: boolean) => void
}) => {
  // Only assess this when the production version is active
  if (process.env.NODE_ENV === 'production') {
    assertNonNullish(FORMSPARK_FORM_ID, 'FormSpark ID not defined')
  }
  const [submit, submitting] = useFormspark({
    formId: FORMSPARK_FORM_ID,
  })
  const [complete, setComplete] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState(false)

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      const { solution } = await botpoison.challenge()
      await submit({ message, _botpoison: solution })
      setComplete(true)
    } catch (err) {
      setError(true)
    }
  }

  return (
    <CustomModal
      open={betaFormOpen}
      modalTitle="Beta Access"
      modalAriaLabel="beta-access-form"
      handleClose={() => setBetaFormOpen(false)}
    >
      <>
        <GS.TextMutedParagraph>
          Request access to the private beta of Juno. Your email needs to be a
          Google email address.
        </GS.TextMutedParagraph>
        <GS.TextMutedParagraph>
          You can expect a reply on your request within a few hours. If you want
          to get in direct contact, use the{' '}
          <S.StyledLink href={import.meta.env.VITE_DISCORD_SOCIAL_URL}>
            <QiLinkOut />
            <span title="Open new tab in your browser with Discord">
              Discord Community.
            </span>
          </S.StyledLink>
        </GS.TextMutedParagraph>
        <S.StyledForm onSubmit={onSubmit}>
          {!complete && (
            <>
              <S.StyledInput
                type="email"
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="enter your email"
              />
              <S.SubmitButton type="submit" disabled={submitting}>
                {submitting ? (
                  <S.LoadingIconContainer>
                    <span>Request access</span>{' '}
                    <StyledCircularProgress size={20} />
                  </S.LoadingIconContainer>
                ) : (
                  'Request access'
                )}
              </S.SubmitButton>
            </>
          )}
          {complete && (
            <S.SuccessMessage>
              <FiCheck size={20} />
              <span>You will be contacted shortly</span>
            </S.SuccessMessage>
          )}
        </S.StyledForm>
        {error && (
          <span>
            Something went wrong, reach out to us on{' '}
            <a href={import.meta.env.VITE_DISCORD_SOCIAL_URL}>Discord</a>
          </span>
        )}
      </>
    </CustomModal>
  )
}

export default BetaAccesForm
