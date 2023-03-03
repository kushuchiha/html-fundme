import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, ContractAddress } from "./constants.js"

const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const BalanceButton = document.getElementById("BalanceButton")
const WithdrawButton = document.getElementById("WithdrawButton")

connectButton.onclick = connect
fundButton.onclick = fund
BalanceButton.onclick = getBalance
WithdrawButton.onclick = withdraw

async function connect() {
    if (typeof window.ethereum != undefined) {
        await window.ethereum.request({ method: "eth_requestAccounts" })
        console.log("connected")
        document.getElementById("connectButton").innerHTML = "Connected"
    } else {
        console.log("no metamask")
        document.getElementById("connectButton").innerHTML =
            "Plz install metamask"
    }
}

async function getBalance() {
    if (typeof window.ethereum != undefined) {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const balance = await provider.getBalance(ContractAddress)
        console.log(ethers.utils.formatEther(balance))
    }
}

function listenfortx(TxResponse, provider) {
    console.log(`Mining ${TxResponse.hash}...`)

    return new Promise((resolve, reject) => {
        provider.once(TxResponse.hash, (TransactionReciept) => {
            console.log(
                `Completed with ${TransactionReciept.confirmations} confirmations`
            )
            resolve()
        })
    })
}

async function fund() {
    const ethAmount = document.getElementById("EthAmount").value
    console.log(`Funding with ${ethAmount}`)
    if (typeof window.etherium != undefined) {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        console.log(signer)
        const contract = new ethers.Contract(ContractAddress, abi, signer)
        try {
            const TxResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            })
            await listenfortx(TxResponse, provider)
            console.log("DONE...")
        } catch (error) {
            console.log(error)
        }
    }
}

async function withdraw() {
    if (typeof window.ethereum != undefined) {
        console.log("Withdrawing...")
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(ContractAddress, abi, signer)
        try {
            const TxResponse = await contract.withdraw()
            await listenfortx(TxResponse, provider)
        } catch (error) {
            console.log(error)
        }
    }
}
