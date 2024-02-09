"use client"
import { supabaseBrowser } from '../../utils/supbaseClients/browser';
import React from 'react';

const ChatHeader = ({ user }) => {
    const supabase = supabaseBrowser();
    const signIn = async () => {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/api/auth/callback/route`,
            },
        });
        if (error) {
            console.error('Error signing in:', error);
        }
    };
    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (!error) {
            alert("Logged Out");
            window.location.reload();
        }
        else {
            alert(String(error));
        }
    }
    return (
        <header className="bg-white pt-5 shadow-md w-full">
            <div className="w-full justify-center text-4xl font-bold flex items-center">
                <h1>CHAT APP</h1>
                <button
                    type="button"
                    onClick={() =>
                        window.open("https://github.com/AKSourav/nextjs-docker")
                    }
                    class="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-3 py-2 me-2 mx-2 :bg-gray-800 :text-white :border-gray-600 :hover:bg-gray-700 :hover:border-gray-600 :focus:ring-gray-700 flex items-center space-x-2"
                >
                    Github
                </button>
            </div>
            <div className="container flex flex-col justify-center items-center">
                <div className="text-lg font-semibold text-gray-800 ">
                    {user ? 'Welcome,' + user?.user_metadata?.name : 'Welcome, Please Sign In with Your College email Id'}
                </div>
                <div className="flex justify-center items-center space-x-4">
                    {user && <span className="text-sm text-gray-600">{user?.email || 'Not logged in'}</span>}
                    {user ? (<button className='bg-red-700 p-2 border-2 rounded ring-2 ring-white ring-opacity-50 shadow-md' onClick={signOut}>Sign Out</button>) : (<button className='bg-green-600 p-2 border-2 rounded ring-2 ring-white ring-opacity-50 shadow-md' onClick={signIn}>Sign In</button>)}
                </div>
            </div>
        </header>
    );
};

export default ChatHeader;
