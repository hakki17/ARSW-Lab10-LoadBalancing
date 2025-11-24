var bigInt = require('big-integer');

const memo = {};

function fibonacciMemo(n) {
  if (n < 0) throw 'must be greater than 0';
  if (n === 0) return bigInt.zero;
  if (n === 1) return bigInt.one;

  if (memo[n]) {
    return memo[n];
  }
  let nth_1 = memo[1] || bigInt.one;
  let nth_2 = memo[0] || bigInt.zero;

  let startFrom = 2;
  for (let i = 2; i <= n; i++) {
    if (memo[i]) {
      nth_2 = memo[i - 1];
      nth_1 = memo[i];
      startFrom = i + 1;
    } else {
      break;
    }
  }

  for (let i = startFrom; i <= n; i++) {
    let answer = nth_2.add(nth_1);
    memo[i] = answer;
    nth_2 = nth_1;
    nth_1 = answer;
  }

  return memo[n];
}

module.exports = async function (context, req) {
  context.log('JavaScript HTTP trigger function (Memoization) processed a request.');

  let nth = req.body.nth;
  let answer;

  try {
    answer = fibonacciMemo(nth);

    context.res = {
      body: answer.toString(),
    };
  } catch (error) {
    context.res = {
      status: 400,
      body: error.toString(),
    };
  }
};
