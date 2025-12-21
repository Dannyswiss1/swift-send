# SwiftSend - Global Money Transfer App

SwiftSend is a modern, user-friendly money transfer application built with React, TypeScript, and Tailwind CSS. It enables instant global money transfers on the Stellar network with both managed wallet and external wallet connectivity options.

## 🚀 Key Features

### Core Functionality
- **Instant Global Transfers**: Send USDC anywhere in the world in 3-5 seconds
- **Competitive Fees**: Network fees as low as $0.01
- **Multi-currency Support**: Built-in exchange rates and local currency display
- **Contact Management**: Save and manage recipient contacts
- **Transaction History**: Complete transaction tracking and history

### Wallet Options
- **Managed Wallet**: Simple, user-friendly wallet managed by SwiftSend
- **External Wallet Support**: Connect your own Stellar wallet for enhanced control
  - Freighter wallet integration
  - Albedo wallet support
  - Rabet wallet compatibility
  - Full transaction transparency
  - Self-custody of private keys

### Security & Compliance
- **Bank-grade Security**: SOC 2 Type II compliant infrastructure
- **FDIC Protection**: Customer funds protected up to $250,000
- **End-to-end Encryption**: All sensitive data encrypted
- **Regulated Operations**: Licensed money transmitter

## 🌟 New: External Wallet Connectivity

SwiftSend now supports connecting external Stellar wallets for power users who want enhanced transparency and control over their transactions.

### Supported Wallets
- **Freighter**: The most popular Stellar wallet browser extension
- **Albedo**: Web-based Stellar wallet with advanced features  
- **Rabet**: Multi-currency Stellar wallet

### Benefits of External Wallet Connection
- ✅ **Full Control**: You own your private keys
- ✅ **Transparency**: View all transactions on blockchain explorers
- ✅ **Security**: Enhanced security through self-custody
- ✅ **Flexibility**: Use the same wallet across multiple Stellar apps
- ✅ **Trust**: No need to trust SwiftSend with your private keys

### How It Works

1. **Optional Connection**: External wallet connection is completely optional
2. **Gradual Onboarding**: New users start with managed wallets, can upgrade later
3. **Seamless Integration**: Choose payment method during each transaction
4. **Transaction Signing**: External wallets sign transactions securely
5. **Blockchain Verification**: All transactions verifiable on Stellar network

## 🛠 Technical Architecture

### Frontend Stack
- **React 18** with TypeScript for type safety
- **Vite** for fast development and building
- **Tailwind CSS** for responsive, modern UI
- **shadcn/ui** for consistent component library
- **Lucide React** for beautiful icons

### Wallet Integration
- **WalletConnect** protocol support (planned)
- **Direct wallet extensions** integration
- **Stellar SDK** for blockchain interactions
- **Real-time balance updates**
- **Transaction status tracking**

### State Management
- **React Context** for wallet and authentication state
- **Local Storage** for connection persistence
- **Toast notifications** for user feedback

## 📦 Project Structure

```
src/
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── WalletConnection.tsx   # Wallet connection dialog and status
│   ├── TransactionSigning.tsx # External wallet transaction signing
│   └── ...                    # Other app components
├── contexts/
│   ├── AuthContext.tsx        # Authentication state
│   ├── WalletContext.tsx      # External wallet state management
├── pages/
│   ├── Dashboard.tsx          # Main dashboard with wallet options
│   ├── SendMoney.tsx          # Money transfer with wallet choice
│   ├── Profile.tsx            # Wallet management settings
│   └── ...
├── types/
│   └── index.ts              # TypeScript type definitions
└── ...
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Modern browser with wallet extension (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/swift-send.git
   cd swift-send
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

### Wallet Setup (Optional)

To test external wallet features:

1. **Install a Stellar wallet**:
   - [Freighter](https://freighter.app/) (recommended)
   - [Rabet](https://rabet.io/)
   - [Albedo](https://albedo.link/) (web-based)

2. **Create or import wallet**
3. **Connect in SwiftSend**:
   - Go to Dashboard → Connect Wallet
   - Or Profile → Wallet Management

## 🔧 Configuration

### Environment Variables
```env
# Optional: Configure for different networks
VITE_STELLAR_NETWORK=mainnet  # or testnet
VITE_STELLAR_HORIZON_URL=https://horizon.stellar.org
```

### Wallet Provider Configuration
The app automatically detects installed wallet extensions and provides fallbacks for web-based wallets.

## 💡 Usage Examples

### Basic Money Transfer
1. Sign up with email or phone
2. Add funds to your managed wallet  
3. Send money globally using recipient's email/phone

### Advanced Transfer with External Wallet
1. Connect your Stellar wallet from Dashboard
2. Choose external wallet when sending money
3. Review transaction in SwiftSend
4. Approve and sign in your external wallet
5. View transaction on Stellar blockchain explorer

### Wallet Management
- **Dashboard**: View both managed and external wallet balances
- **Profile**: Connect/disconnect external wallets
- **Transaction History**: See both wallet types
- **Settings**: Configure wallet preferences

## 🔒 Security Features

### Managed Wallet Security
- Multi-signature custody
- Cold storage for large amounts
- Real-time fraud monitoring
- Insurance coverage

### External Wallet Security
- Private keys never leave your device
- Transaction signing happens locally
- Full audit trail on blockchain
- Self-sovereign control

## 🌐 Stellar Network Integration

SwiftSend leverages the Stellar blockchain for:

- **Fast Settlement**: 3-5 second transaction finality
- **Low Costs**: Network fees around $0.01
- **Global Reach**: Built-in currency exchange
- **Transparency**: All transactions publicly verifiable
- **Stability**: Using regulated USDC stablecoin

## 📱 Mobile Responsiveness

SwiftSend is designed mobile-first with:
- Progressive Web App (PWA) capabilities
- Touch-optimized interface
- Responsive design for all screen sizes
- Native app-like experience

## 🛣 Roadmap

### Near Term
- [ ] WalletConnect protocol integration
- [ ] Additional Stellar wallet support
- [ ] Enhanced transaction analytics
- [ ] Multi-asset support

### Future Plans
- [ ] DeFi integrations
- [ ] Recurring payments
- [ ] Business accounts
- [ ] API for developers

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.swiftsend.app](https://docs.swiftsend.app)
- **Support Email**: support@swiftsend.app  
- **Discord**: [SwiftSend Community](https://discord.gg/swiftsend)
- **Twitter**: [@SwiftSendApp](https://twitter.com/swiftsendapp)

## 🏆 Acknowledgments

- [Stellar Development Foundation](https://stellar.org) for the blockchain infrastructure
- [shadcn/ui](https://ui.shadcn.com) for the component library
- [Lucide](https://lucide.dev) for the icon set
- Open source wallet providers: Freighter, Albedo, Rabet

---

**Built with ❤️ for the future of global finance**