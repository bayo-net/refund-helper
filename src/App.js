import { useState } from 'react';
import './App.css';
import moment from 'moment';

function App() {

  const [walletAddress, setWalletAddress] = useState()

  const [loading, setLoading] = useState(false)

  const [data, setData] = useState();

  const baseUrl = "https://api.solscan.io/account/token/txs"

  const farmId = "HUfVysibcL4u6EVoi4GsSDnV993tRX47ntoYH123q9AB"

  const tokenAddress = "FoRGERiW7odcCBGU1bztZi16osPBHjxharvDathL5eds"

  const getTime = (blockTime) => {
    const txDate = moment.unix(blockTime).format("YYYY-MM-DD HH:mm:ss")
    const now = moment()
    return moment(new Date(txDate)).fromNow();
  }

  const fetchData = async (url) => {
    const response = await fetch(url);
    const responseData = await response.json();
    if(responseData){
      const allSplTransfers = responseData.data.tx.transactions;
      const allTransactions = await Promise.all(allSplTransfers.map(async (splTransfer) => {
        const signature = splTransfer.txHash;
        const data = await fetch(`https://api.solscan.io/transaction?tx=${signature}&cluster=`)
        return data.json()
      }))
      const farmTransactions = await Promise.all(allTransactions.filter((transaction) => {
        if(!transaction.hasOwnProperty("parsedInstruction")) return false
        const parsedInstruction = transaction.parsedInstruction[0]
        return parsedInstruction.programId === farmId
      }))
      setData(farmTransactions)
    }
    setLoading(false)
  }

  const formatTransaction = (txUrl) => {
    const firstPart = txUrl.slice(0, 12)
    const secondPart = txUrl.slice(-12)
    return `${firstPart}...${secondPart}`;
  }

  const handleClick = () => {
    if(walletAddress !== ""){
      setLoading(true)
      const url = `${baseUrl}?address=${walletAddress}&token_address=${tokenAddress}&offset=${0}&limit=${50}&cluster=`
      fetchData(url)
    }
  }

  return (
    <>
     {/* Add toast */}
      <div className="text-center">
        <div className='text-white text-lg mt-20'>
          <p className='mb-3'>Enter Wallet Address</p>
          <input type="text" className='text-black p-2 mb-3' value={walletAddress} onChange={(e) => setWalletAddress(e.target.value)}/>
          <p className='mb-2'>Wallet Address: {walletAddress}</p>
          <button className='bg-violet-600 px-4 py-2 rounded-lg' onClick={handleClick}>Search</button>
        </div>
        <div className='mt-2'>
            {
              loading && (<div className='text-white'>
                Loading...
              </div>)
            }
          </div>
          {
            !loading && <div className='mt-4'>
            {
                <div className='text-white'>
                  <p className='text-green-600'>FORGE Claim Transactions</p>
                  <div className='mt-5'>
                   {
                      data?.map(tx => {
                        return (
                          <div className='flex flex-row justify-center mb-3 p-2'>
                            <p className='mr-5'>Time: {getTime(tx.blockTime)}</p>
                            <p>{formatTransaction(tx.txHash)}</p>
                            <a href={`https://solscan.io/tx/${tx.txHash}`} target="_blank" rel="noopener noreferrer" className='ml-4 text-violet-700'>Open Tx Link</a>
                          </div>
                        )
                      })
                    }
                  </div>
                </div>
            }
          </div>
        }
      </div> 
    </>
  );
}

export default App;
