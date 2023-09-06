import GaugeBox from "components/GaugeBox";

const GaugeChartBox = ({ title, value, footer = <></> }) => {
  const boxsize = "w-full flex-1 h-[150px] lg:h-[170px]";
  return (
    <div className={`${boxsize} border border-[#E9EAED] px-3 pt-2 pb-5 `}>
      <div className="text-dark whitespace-nowrap text-md lg:text-lg">
        {title}
      </div>
      <div className="flex justify-between">
        <div className="w-1/3">
          <GaugeBox value={value} />
        </div>

        <div className="px-4 w-2/3 flex flex-col justify-center text-right">
          <span className={`text-secondary text-[40px] font-bold `}>
            {value}%
          </span>
          {footer}
        </div>
      </div>
    </div>
  );
};
export default GaugeChartBox;
