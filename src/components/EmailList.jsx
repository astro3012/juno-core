import React, { useEffect } from 'react'
import CircularProgress from '@material-ui/core/CircularProgress'
import { connect } from 'react-redux'
import EmailListItem from './EmailListItem/EmailListItem'
import { loadDraftList, loadEmails } from '../Store/actions'
import '../App.scss'
import Emptystate from './Elements/EmptyState'

const LOAD_OLDER = 'Load older messages'
const MAX_RESULTS = 20

const mapStateToProps = (state) => {
  const {
    labelIds,
    metaList,
    nextPageToken,
    emailList,
    isLoading,
    loadedInbox,
  } = state
  return {
    labelIds,
    metaList,
    nextPageToken,
    emailList,
    isLoading,
    loadedInbox,
  }
}

const EmailList = ({
  labelIds,
  dispatch,
  emailList,
  isLoading,
  loadedInbox,
}) => {
  useEffect(() => {
    if (
      labelIds &&
      labelIds.some((val) => loadedInbox.flat(1).indexOf(val) === -1)
    ) {
      const params = {
        labelIds,
        maxResults: MAX_RESULTS,
      }
      console.log(`loading ${labelIds}`)
      dispatch(loadEmails(params))
      console.log(labelIds)
      if (labelIds.includes('DRAFT')) {
        console.log('here')
        dispatch(loadDraftList())
      }
    }
  }, [labelIds])

  const loadNextPage = (nextPageToken) => {
    if (labelIds && nextPageToken) {
      const params = {
        labelIds,
        nextPageToken,
        maxResults: MAX_RESULTS,
      }
      dispatch(loadEmails(params))
    }
  }

  const renderEmailList = (filteredOnLabel) => {
    const { threads, nextPageToken } = filteredOnLabel && filteredOnLabel
    return (
      <>
        <div className="scroll">
          <div className="tlOuterContainer">
            <div className="thread-list">
              {threads.length > 0 && (
                <div className="base">
                  {threads.map((email) => (
                    <EmailListItem key={email.id} email={email} />
                  ))}
                </div>
              )}
              {threads.length === 0 && <Emptystate />}
            </div>
            {nextPageToken && (
              <div className="d-flex justify-content-center mb-5">
                {!isLoading && (
                  <button
                    className="btn btn-sm btn-light"
                    disabled={isLoading}
                    onClick={() => loadNextPage(labelIds, nextPageToken)}
                    type="button"
                  >
                    {LOAD_OLDER}
                  </button>
                )}
                {isLoading && <CircularProgress />}
              </div>
            )}
          </div>
        </div>
      </>
    )
  }

  const labeledInbox = () => {
    if (labelIds) {
      const filteredOnLabel = emailList.filter((threadList) =>
        threadList.labels.includes(...labelIds)
      )
      return renderEmailList(filteredOnLabel[0])
    }
    return null
  }

  return (
    <>
      {labelIds &&
        !labelIds.some((val) => loadedInbox.flat(1).indexOf(val) === -1) &&
        emailList.length > 0 &&
        labeledInbox({ labelIds, emailList })}
    </>
  )
}

export default connect(mapStateToProps)(EmailList)
