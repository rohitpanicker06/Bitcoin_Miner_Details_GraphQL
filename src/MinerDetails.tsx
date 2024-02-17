// In MinerDetails.tsx
import React, { useState , useEffect} from 'react';
import { useLazyQuery, gql } from '@apollo/client';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useNavigate } from 'react-router-dom'; // Import useNavigate instead of useHistory
import styles from './MinerDetails.module.css';

const GET_BITCOIN_OUTPUTS = gql`
query GetBitcoinOutputs($network: BitcoinNetwork!, $limit: Int!, $offset: Int!, $from: ISO8601DateTime, $till: ISO8601DateTime) {
  bitcoin(network: $network) {
    outputs(
      options: {desc: "reward", asc: "address.address", limit: $limit, offset: $offset}
      time: {since: $from, till: $till}
      txIndex: {is: 0}
      outputDirection: {is: mining}
      outputScriptType: {notIn: ["nulldata", "nonstandard"]}
    ) {
      address: outputAddress {
        address
        annotation
      }
      reward: value
      reward_usd: value(in: USD)
      count(uniq: blocks)
      min_date: minimum(of: date)
      max_date: maximum(of: date)
    }
  }
}
`;

const MinerDetails: React.FC = () => {
  const [fromDate, setFromDate] = useState(new Date(new Date().setDate(new Date().getDate() - 7)));
  const [tillDate, setTillDate] = useState(new Date());
  const navigate = useNavigate(); // Use the useNavigate hook for navigation

  const [fetchBitcoinOutputs, { called, loading, data, error }] = useLazyQuery(GET_BITCOIN_OUTPUTS, {
    fetchPolicy: 'network-only', // Optional: ensures fresh data is fetched
  });
  useEffect(() => {
    fetchBitcoinOutputs({
      variables: {
        network: "bitcoin",
        limit: 10,
        offset: 0,
        from: fromDate.toISOString(),
        till: tillDate.toISOString(),
      },
    });
  }, []); 

  const handleSearch = () => {
    fetchBitcoinOutputs({
      variables: {
        network: "bitcoin",
        limit: 10,
        offset: 0,
        from: fromDate.toISOString(),
        till: tillDate.toISOString(),
      },
    });
  };


  // Function to handle address click, navigates to AddressDetails
  const handleAddressClick = (address: string) => {
    navigate(`/address/${address}`, {
      state: {
        from: fromDate.toISOString(),
        till: tillDate.toISOString(),
      }
    });
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :( Please try again</p>;

  return (
    <div className={styles.tableContainer}>
      <h2>Miner Details</h2>
      <div>
        <DatePicker className={styles.datePicker} selected={fromDate} onChange={(date: Date) => setFromDate(date)} />
        <DatePicker className={styles.datePicker} selected={tillDate} onChange={(date: Date) => setTillDate(date)} />
        <button className={styles.searchButton} onClick={handleSearch}>Search</button>
      </div>
      {called && !loading && !error && (
        <table className={styles.table}>
          <thead>
            <tr>
              {["Miner", "Block Count", "First Block Date", "Last Block Date", "Block Reward, BTC"].map(header => (
                <th className={styles.th} key={header}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
  {data?.bitcoin.outputs.map((output: any, index: number) => (
    <tr key={index} onClick={() => handleAddressClick(output.address.address)} style={{ cursor: 'pointer' }}>
      <td className={styles.td}>
        {/* Wrap the address in an <a> tag and apply the addressLink class */}
        <a className={styles.addressLink} onClick={(e) => {
          e.stopPropagation(); // Prevent the click from bubbling up to the <tr>
          handleAddressClick(output.address.address);
        }}>
          {output.address.address}
        </a>
      </td>
      <td className={styles.td}>{output.count}</td>
      <td className={styles.td}>{output.min_date}</td>
      <td className={styles.td}>{output.max_date}</td>
      <td className={styles.td}>
        {output.reward.toFixed(2)}{' '}
        <sup style={{ color: 'green' }}>
          ${output.reward_usd.toLocaleString('en-US', { style: 'currency', currency: 'USD' }).slice(1)}
        </sup>
      </td>
    </tr>
  ))}
</tbody>

        </table>
      )}
    </div>
  );
};

export default MinerDetails;
