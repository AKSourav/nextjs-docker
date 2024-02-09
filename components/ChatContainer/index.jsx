import React, { FC, useMemo } from 'react'
const ChatContainer = ({ user, children }) => {
    const emailDomain = useMemo(() => user?.email?.split('@')[1] || null, [user]);
    return (
        <>
            {
                emailDomain ? (<>
                    {emailDomain.startsWith('heritage') ? <> {children}</> : <>
                        <div className='flex justify-center items-center'>
                            <h1>Login with Heritage email Id</h1>
                        </div>
                    </>}
                </>) : (
                    <>
                        <div className='flex justify-center items-center'>
                            <h1>Login To get Acccess</h1>
                        </div>
                    </>
                )
            }
        </>
    )
}

export default ChatContainer