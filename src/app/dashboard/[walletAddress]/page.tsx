'use client';

import { client } from "@/app/client";
import CampaignCard from "@/app/components/CampaignCard";
import { CROWDFUNDING_FACTORY } from "@/app/constants/contracts";
import { getContract } from "thirdweb";
import { sepolia } from "thirdweb/chains";
import { useActiveAccount, useReadContract } from "thirdweb/react";

export default function DashboardPage() {
    const account = useActiveAccount();
    const contract = getContract({
        client: client,
        chain: sepolia,
        address: CROWDFUNDING_FACTORY,
    });

    const { data, isPending } = useReadContract({
        contract,
        method:
            "function getUserCampaigns(address _user) view returns ((address campaignAddress, address owner, string name, uint256 creationTime)[])",
        params: [account?.address as string],
    });
    return (
        <div className="mx-auto max-w-7xl px-4 mt-16 sm:px-6 lg:px-8">
            <div className="flex flex-row justify-between items-center mb-8">
                <p className="text-4xl font-semibold">Dashboard</p>
            </div>
            <p className="text-2xl font-semibold mb-4">My Campaigns:</p>
            <div className="grid grid-cols-3 gap-4 mb-5">
                {!isPending && data && (
                    data && data.length > 0 ? (
                        data.map((campaign, index) => (
                            <CampaignCard
                                key={index}
                                campaignAddress={campaign.campaignAddress}
                            />
                        ))
                    ) : (
                        <p>Kindly Contact to Developer for Creating Campaign</p>
                    )
                )}

            </div>
        </div>

    )
}
