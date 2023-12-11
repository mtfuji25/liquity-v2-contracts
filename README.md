     ██████╗ ███╗   ██╗███████╗███████╗    ██╗   ██╗██████╗
    ██╔═══██╗████╗  ██║██╔════╝╚══███╔╝    ██║   ██║╚════██╗
    ██║   ██║██╔██╗ ██║█████╗    ███╔╝     ██║   ██║ █████╔╝
    ██║   ██║██║╚██╗██║██╔══╝   ███╔╝      ╚██╗ ██╔╝██╔═══╝
    ╚██████╔╝██║ ╚████║███████╗███████╗     ╚████╔╝ ███████╗
    ╚═════╝ ╚═╝  ╚═══╝╚══════╝╚══════╝      ╚═══╝  ╚══════╝

# ONEZ Stablecoin V2

This is the version 2 implementation of the ONEZ stablecoin. It builds on top of [liquity](https://www.liquity.org/) and introduces a new govrenance token `NULLZ` with incentives to grow liquidity.

ONEZ is a self-repaying stablecoin which means users will be able to repay their debt back with the interest earned from depositing their collateral from [ZeroLend](https://zerolend.xyz).

## Features

- Support for multiple ERC20 tokens.
- Deposits collateral into [ZeroLend](https://app.zerolend.xyz/) to earn an extra yield.
- veStaking for the `NULLZ` token with the ability to stake `NULLZ` for 4 years.
