'use client';
import { client } from "@/app/client";
import { CROWDFUNDING_FACTORY } from "@/app/constants/contracts";
import CampaignCard from "@/app/components/CampaignCard";
import { useState } from "react";
import { getContract, prepareContractCall, sendTransaction } from "thirdweb";
import { sepolia } from "thirdweb/chains";
import { useActiveAccount, useReadContract } from "thirdweb/react";

export default function DashboardPage() {
  const account = useActiveAccount();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const contract = getContract({
    client,
    chain: sepolia,
    address: CROWDFUNDING_FACTORY,
  });

  // Fetch user campaigns
  const {
    data: myCampaigns,
    isLoading: isLoadingMyCampaigns,
    refetch,
  } = useReadContract({
    contract,
    method:
      "function getUserCampaigns(address _user) view returns ((address campaignAddress, address owner, string name, uint256 creationTime)[])",
    params: [account?.address as string],
  });

  return (
    <div className="mx-auto max-w-7xl px-4 mt-16 sm:px-6 lg:px-8">
      <div className="flex flex-row justify-between items-center mb-8">
        <p className="text-4xl font-semibold">Dashboard</p>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-md"
          onClick={() => setIsModalOpen(true)}
        >
          Create Campaign
        </button>
      </div>

      <p className="text-2xl font-semibold mb-4">My Campaigns:</p>
      <div className="grid grid-cols-3 gap-4">
        {!isLoadingMyCampaigns &&
          (myCampaigns && myCampaigns.length > 0 ? (
            myCampaigns.map((campaign, index) => (
              <CampaignCard
                key={index}
                campaignAddress={campaign.campaignAddress}
              />
            ))
          ) : (
            <p>No campaigns yet</p>
          ))}
      </div>

      {isModalOpen && (
        <CreateCampaignModal setIsModalOpen={setIsModalOpen} refetch={refetch} />
      )}
    </div>
  );
}

type CreateCampaignModalProps = {
  setIsModalOpen: (value: boolean) => void;
  refetch: () => void;
};

const CreateCampaignModal = ({
  setIsModalOpen,
  refetch,
}: CreateCampaignModalProps) => {
  const account = useActiveAccount();
  const [isDeployingContract, setIsDeployingContract] = useState(false);
  const [campaignName, setCampaignName] = useState("");
  const [campaignDescription, setCampaignDescription] = useState("");
  const [campaignGoal, setCampaignGoal] = useState<string>("1");
  const [campaignDeadline, setCampaignDeadline] = useState<string>("1");

  const handleCreateCampaign = async () => {
    if (!account) {
      alert("Please connect your wallet first.");
      return;
    }

    setIsDeployingContract(true);
    try {
      console.log("Creating campaign via factory...");

      const factory = getContract({
        client,
        chain: sepolia,
        address: CROWDFUNDING_FACTORY,
      });

      // prepare tx for factory.createCampaign
      const tx = prepareContractCall({
        contract: factory,
        method:
          "function createCampaign(string _name, string _description, uint256 _goal, uint256 _durationInDays)",
        params: [
          campaignName,
          campaignDescription,
          BigInt(campaignGoal),
          BigInt(campaignDeadline),
        ],
      });

      await sendTransaction({ transaction: tx, account });

      alert("✅ Campaign created successfully!");
      refetch();
    } catch (error) {
      console.error("Error creating campaign:", error);
      alert("❌ Something went wrong while creating the campaign.");
    } finally {
      setIsDeployingContract(false);
      setIsModalOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center backdrop-blur-md">
      <div className="w-1/2 bg-slate-100 p-6 rounded-md">
        <div className="flex justify-between items-center mb-4">
          <p className="text-lg font-semibold">Create a Campaign</p>
          <button
            className="text-sm px-4 py-2 bg-slate-600 text-white rounded-md"
            onClick={() => setIsModalOpen(false)}
          >
            Close
          </button>
        </div>

        <div className="flex flex-col">
          <label>Campaign Name:</label>
          <input
            type="text"
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
            placeholder="Campaign Name"
            className="mb-4 px-4 py-2 bg-slate-300 rounded-md"
          />

          <label>Campaign Description:</label>
          <textarea
            value={campaignDescription}
            onChange={(e) => setCampaignDescription(e.target.value)}
            placeholder="Campaign Description"
            className="mb-4 px-4 py-2 bg-slate-300 rounded-md"
          ></textarea>

          <label>Campaign Goal (wei):</label>
          <input
            type="number"
            value={campaignGoal}
            onChange={(e) => setCampaignGoal(e.target.value)}
            className="mb-4 px-4 py-2 bg-slate-300 rounded-md"
          />

          <label>Campaign Length (Days):</label>
          <input
            type="number"
            value={campaignDeadline}
            onChange={(e) => setCampaignDeadline(e.target.value)}
            className="mb-4 px-4 py-2 bg-slate-300 rounded-md"
          />

          <button
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md"
            onClick={handleCreateCampaign}
            disabled={isDeployingContract}
          >
            {isDeployingContract ? "Creating Campaign..." : "Create Campaign"}
          </button>
        </div>
      </div>
    </div>
  );
};
