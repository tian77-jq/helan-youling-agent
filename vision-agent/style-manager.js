const styles=['国风插画','旅行纪念卡','文创海报','星空剪影']
function normalize(value){return styles.includes(value)?value:styles[0]}
module.exports={styles,normalize}
