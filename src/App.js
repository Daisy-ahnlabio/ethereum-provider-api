import { useState, useEffect } from 'react';
import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider'

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [userInfo, setUserInfo] = useState({});

  //사용자 주소 가져옴, dapp 과 지갑이 연결된 후여야 가져와짐
  useEffect(() => {
    function checkConnectedWallet() {
      const userData = JSON.parse(localStorage.getItem('userAccount'));
      if (userData != null) {
        setUserInfo(userData);
        setIsConnected(true);
      }
    }
    checkConnectedWallet();
  }, []);

  // detectEthereumProvider api 로 대체
  // const detectCurrentProvider = () => {
  //   let provider;
  //   if (window.ethereum) {
  //     provider = window.ethereum;
  //   } else if (window.web3) {
  //     // eslint-disable-next-line
  //     provider = window.web3.currentProvider;
  //   } else {
  //     console.log(
  //       '이더리움이 아닌 브라우저가 탐지되었습니다. MetaMask를 사용해 보세요!'
  //     );
  //   }
  //   return provider;
  // };

  const onConnect = async () => {
    try {

      console.log(" window.ethereum ++ ", window.ethereum) // window.ethereum이 있다(MetaMask가 설치된 상태)면 web3 객체를 주입한다. (MetaMask가 window.ethereum을 제공하고 있다.)
      console.log(" window.web3 ++ ", window.web3) //indow.web3가 있다(MetaMask가 설치된 상태)면 해당 객체에 속한 currentProvider로 web3 객체를 주입한다 , 현재 window.web3는 레거시 코드이고 사용을 지양

      // const currentProvider = detectCurrentProvider();
      const currentProvider = await detectEthereumProvider();
      if (currentProvider) {
        if (currentProvider !== window.ethereum) {
          console.log(
            '이더리움이 아닌 브라우저가 탐지되었습니다. MetaMask를 사용해 보세요!'
          );
        }
        await currentProvider.request({ method: 'eth_requestAccounts' }); // web3 객체가 있으면 계정 정보를 가져온.  MetaMask를 통해 Ethereum에 RPC 요청을 제출하는 데 사용 합니다

        const web3 = new Web3(currentProvider);  // http 에서 동작하는 node 에 연결하기 위해 HttpProvider 를 사용해 web3 객체를 생성한다.
        console.log("web3web3 ++ ", web3)

        const userAccount = await web3.eth.getAccounts();
        console.log("userAccount ++ ", userAccount)

        const chainId = await web3.eth.getChainId();
        console.log("chainId ++ ", chainId)

        const account = userAccount[0];
        console.log("account ++ ", userAccount)

        let ethBalance = await web3.eth.getBalance(account);  // 지갑 잔고 가져오기
        ethBalance = web3.utils.fromWei(ethBalance, 'ether'); // 잔액을 Wei로 변환

        // 유저 정보 state에 저장하기
        saveUserInfo(ethBalance, account, chainId);
        if (userAccount.length === 0) {
          console.log('지갑과 연동 하세요');
        }
      }
    } catch (err) {
      console.log(
        '계정을 가져오는 동안 오류가 발생했습니다. 이더리움 클라이언트가 올바르게 구성되었는지 확인하십시오.'
      );
    }
  };

  // 연동해지
  const onDisconnect = () => {
    window.localStorage.removeItem('userAccount');
    setUserInfo({});
    setIsConnected(false);
  };

  // 유저정보
  const saveUserInfo = (ethBalance, account, chainId) => {
    const userAccount = {
      account: account,
      balance: ethBalance,
      connectionid: chainId,
    };
    window.localStorage.setItem('userAccount', JSON.stringify(userAccount)); //유지될 사용자 데이터
    const userData = JSON.parse(localStorage.getItem('userAccount'));
    setUserInfo(userData);
    setIsConnected(true);
  };

  return (
    <div className="app">
      <div className="app-header">
        <h1>Web3.js 및 메타마스크를 통한 React dApp 인증</h1>
      </div>
      <div className="app-wrapper">
        {!isConnected && (
          <div>
            {/* <img src={MetamaskLogo} alt="meta mask logo" /> */}
            <button className="app-buttons__login" onClick={onConnect}>
              Connect to wallet
            </button>
          </div>
        )}
      </div>
      {isConnected && (
        <div className="app-wrapper">
          <div className="app-details">
            <h2>✅지갑과 연동 완✅</h2>
            <div className="app-account">
              <span>Account number:</span>
              {userInfo.account}
            </div>
            <div className="app-balance">
              <span>Balance:</span>
              {userInfo.balance}
            </div>
            <div className="app-connectionid">
              <span>Connection ID:</span>
              {userInfo.connectionid}
            </div>
          </div>
          <div>
            <button className="app-buttons__logout" onClick={onDisconnect}>
              연동 해지
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;