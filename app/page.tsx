'use client'

import { supabase } from '@/lib/supabase'
import { useState } from 'react';
import { useAccount, useSwitchChain } from 'wagmi';
import { useSendCalls } from 'wagmi/experimental';
import { createCoinCall, DeployCurrency, ValidMetadataURI } from '@zoralabs/coins-sdk';
import { base } from 'viem/chains';
import React from 'react';
import { encodeFunctionData } from 'viem';

import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from '@coinbase/onchainkit/wallet';
import {
  Address,
  Avatar,
  Name,
  Identity,
  EthBalance,
} from '@coinbase/onchainkit/identity';
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import { useEffect } from 'react';

export default function DebugPage() {
  const { setFrameReady, isFrameReady } = useMiniKit();

  // The setFrameReady() function is called when your mini-app is ready to be shown
  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);
  const [message, setMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hash, setHash] = useState<`0x${string}` | undefined>();

  // State for Create Coin form
  const [coinName, setCoinName] = useState('');
  const [coinSymbol, setCoinSymbol] = useState('');
  const [coinUri, setCoinUri] = useState('');

  // State for Metadata Creator form
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedMetadataUrl, setUploadedMetadataUrl] = useState('');
  const [metadataName, setMetadataName] = useState('');
  const [metadataDescription, setMetadataDescription] = useState('');
  const [metadataImage, setMetadataImage] = useState('');
  const [metadataContentUri, setMetadataContentUri] = useState('');
  const [metadataContentMime, setMetadataContentMime] = useState('');

  // State for Image Uploader
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');

  const account = useAccount();
  const { switchChain } = useSwitchChain();

  const { sendCalls, status } = useSendCalls({
    mutation: {
      onSuccess: (data) => {
        console.log('Transaction successful:', data);
        setHash(data.id as `0x${string}`);
        setMessage('Transaction successful!');
        setIsLoading(false);
      },
      onError: (error) => {
        console.error('Transaction failed:', error);
        setError('Transaction failed. Please try again.');
        setMessage(`Error: ${error.message}`);
        setIsLoading(false);
      },
    },
  });

  const handleImageUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFile) {
      setError('Please select an image to upload.');
      return;
    }

    setIsUploadingImage(true);
    setMessage('');
    setError(null);
    setUploadedImageUrl('');

    try {
      const fileName = `image-${Date.now()}-${selectedFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, selectedFile);

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(fileName);

      if (!publicUrl) {
        throw new Error('Could not get public URL for the uploaded file.');
      }

      setUploadedImageUrl(publicUrl);
      setMetadataImage(publicUrl);
      setMetadataContentUri(publicUrl);
      setMetadataContentMime(selectedFile.type);
      setMessage('Image uploaded successfully!');
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      setError(errorMessage);
      setMessage(`Error: ${errorMessage}`);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleUploadMetadata = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsUploading(true);
    setMessage('');
    setError(null);
    setUploadedMetadataUrl('');

    try {
      const metadata = {
        name: metadataName,
        description: metadataDescription,
        symbol: coinSymbol, // Using coinSymbol from the other form as per example
        image: metadataImage,
        content: {
          uri: metadataContentUri,
          mime: metadataContentMime,
        },
      };

      const metadataBlob = new Blob([JSON.stringify(metadata, null, 2)], { type: 'application/json' });
      const fileName = `metadata-${Date.now()}.json`;

      const { error: uploadError } = await supabase.storage.from('metadata').upload(fileName, metadataBlob);

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      const { data: { publicUrl } } = supabase.storage.from('metadata').getPublicUrl(fileName);

      if (!publicUrl) {
        throw new Error('Could not get public URL for the uploaded file.');
      }

      setUploadedMetadataUrl(publicUrl);
      setCoinUri(publicUrl); // auto-populate the other form
      setMessage('Metadata uploaded successfully!');
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      setError(errorMessage);
      setMessage(`Error: ${errorMessage}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateCoin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!account.isConnected || !account.address) {
      const errorMsg = 'Please connect your wallet first';
      setError(errorMsg);
      setMessage(errorMsg);
      return;
    }

    if (account.chainId !== base.id) {
      try {
        await switchChain({ chainId: base.id });
      } catch (e) {
        console.error("Failed to switch chain", e);
        const errorMsg = "Please switch to the Base network to continue.";
        setError(errorMsg);
        setMessage(errorMsg);
        return;
      }
    }

    setIsLoading(true);
    setError(null);
    setMessage('Preparing transaction...');

    try {
      const coinParams = {
        name: coinName,
        symbol: coinSymbol,
        uri: coinUri as ValidMetadataURI,
        payoutRecipient: account.address,
        chainId: base.id,
        currency: DeployCurrency.ETH
      };

      const callParams = await createCoinCall(coinParams);
      
      const data = encodeFunctionData({
        abi: callParams.abi,
        functionName: callParams.functionName,
        args: callParams.args,
      });

      setMessage('Sending transaction via paymaster...');
      
      await sendCalls({
        calls: [
          {
            to: callParams.address,
            data,
            value: callParams.value,
          },
        ],
        capabilities: {
          paymasterService: {
            url: process.env.NEXT_PUBLIC_CDP_PAYMASTER as string,
          },
        },
      });
    } catch (err) {
      console.error('Error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to send transaction. Please try again.';
      setError(errorMessage);
      setMessage(`Error: ${errorMessage}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold">Create coin page</h1>
      <p className="mt-4 text-lg">Create coin mini app</p>
      <div className="mt-8 flex flex-col items-center gap-4 w-full px-4">
        
     

        <form onSubmit={handleImageUpload} className="w-full max-w-md p-4 border rounded-lg shadow-md flex flex-col gap-4">
          <h2 className="text-2xl font-semibold text-center">Image Uploader</h2>
          <div>
            <label htmlFor="imageFile" className="block text-sm font-medium text-gray-700">Select Image</label>
            <input
              type="file"
              id="imageFile"
              onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
              accept="image/*"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 font-bold text-white bg-indigo-500 rounded hover:bg-indigo-700 disabled:bg-gray-400"
            disabled={isUploadingImage || !selectedFile}
          >
            {isUploadingImage ? 'Uploading...' : 'Upload Image to Supabase'}
          </button>
          {uploadedImageUrl && (
            <div className="p-2 mt-2 text-left bg-green-100 rounded-md">
              <p className="font-mono text-sm break-all">Uploaded Image URL: <a href={uploadedImageUrl} target="_blank" rel="noopener noreferrer" className="text-green-600">{uploadedImageUrl}</a></p>
            </div>
          )}
        </form>

        <form onSubmit={handleUploadMetadata} className="w-full max-w-md p-4 border rounded-lg shadow-md flex flex-col gap-4">
          <h2 className="text-2xl font-semibold text-center">URI Metadata Creator</h2>
          {/* Form fields for metadata */}
          <div>
            <label htmlFor="metadataName" className="block text-sm font-medium text-gray-700">Metadata Name</label>
            <input type="text" id="metadataName" value={metadataName} onChange={(e) => setMetadataName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
          </div>
          <div>
            <label htmlFor="metadataDescription" className="block text-sm font-medium text-gray-700">Description</label>
            <input type="text" id="metadataDescription" value={metadataDescription} onChange={(e) => setMetadataDescription(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
          </div>
          <div>
            <label htmlFor="metadataImage" className="block text-sm font-medium text-gray-700">Image URL</label>
            <input type="text" id="metadataImage" value={metadataImage} onChange={(e) => setMetadataImage(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
          </div>
          <div>
            <label htmlFor="metadataContentUri" className="block text-sm font-medium text-gray-700">Content URI</label>
            <input type="text" id="metadataContentUri" value={metadataContentUri} onChange={(e) => setMetadataContentUri(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
          </div>
          <div>
            <label htmlFor="metadataContentMime" className="block text-sm font-medium text-gray-700">Content Mime Type</label>
            <input type="text" id="metadataContentMime" value={metadataContentMime} onChange={(e) => setMetadataContentMime(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
          </div>
          <button type="submit" className="w-full px-4 py-2 font-bold text-white bg-purple-500 rounded hover:bg-purple-700 disabled:bg-gray-400" disabled={isUploading}>
            {isUploading ? 'Uploading...' : 'Upload Metadata to Supabase'}
          </button>
          {uploadedMetadataUrl && (
            <div className="p-2 mt-2 text-left bg-blue-100 rounded-md">
              <p className="font-mono text-sm break-all">Uploaded URL: <a href={uploadedMetadataUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600">{uploadedMetadataUrl}</a></p>
            </div>
          )}
        </form>

        <form onSubmit={handleCreateCoin} className="w-full max-w-md p-4 border rounded-lg shadow-md flex flex-col gap-4">
          <h2 className="text-2xl font-semibold text-center">Create a New Coin</h2>
          <div>
            <label htmlFor="coinName" className="block text-sm font-medium text-gray-700">Coin Name</label>
            <input
              type="text"
              id="coinName"
              value={coinName}
              onChange={(e) => setCoinName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label htmlFor="coinSymbol" className="block text-sm font-medium text-gray-700">Coin Symbol</label>
            <input
              type="text"
              id="coinSymbol"
              value={coinSymbol}
              onChange={(e) => setCoinSymbol(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label htmlFor="coinUri" className="block text-sm font-medium text-gray-700">Metadata URI</label>
            <input
              type="text"
              id="coinUri"
              value={coinUri}
              onChange={(e) => setCoinUri(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 font-bold text-white bg-green-500 rounded hover:bg-green-700 disabled:bg-gray-400"
            disabled={isLoading || !account.isConnected}
          >
            {isLoading ? 'Creating...' : 'Create Coin with Paymaster'}
          </button>
        </form>

        <Wallet>
          <ConnectWallet>
            <Avatar className="h-6 w-6" />
            <Name />
          </ConnectWallet>
          <WalletDropdown>
            <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
              <Avatar />
              <Name />
              <Address />
              <EthBalance />
            </Identity>
            <WalletDropdownDisconnect />
          </WalletDropdown>
        </Wallet>
        {error && (
          <div className="p-4 mt-4 text-left bg-red-100 rounded-md w-full max-w-md">
            <p className="font-mono text-sm">Error: {error}</p>
          </div>
        )}
        {status === 'success' && hash && (
          <div className="p-4 mt-4 text-left bg-green-100 rounded-md w-full max-w-md">
            <p className="font-mono text-sm">Transaction successful!</p>
          </div>
        )}
        {hash && (
          <div className="p-4 mt-4 text-left bg-gray-100 rounded-md w-full max-w-md">
            <p className="font-mono text-sm">
              Transaction Hash:{' '}
              <a
                href={`https://basescan.org/tx/${hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                {hash}
              </a>
            </p>
          </div>
        )}
        {message && (
          <div className="p-4 mt-4 text-left bg-gray-100 rounded-md w-full max-w-md">
            <p className="font-mono text-sm">{message}</p>
          </div>
        )}

      </div>
    </div>
  )
}
