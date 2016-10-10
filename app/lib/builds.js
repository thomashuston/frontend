export function buildTime(build) {
  const { state, startedAt, canceledAt, finishedAt, scheduledAt } = build;
  const buildTime = {};

  switch (state) {
    case 'blocked':
    case 'canceled':
    case 'canceling':
    case 'failed':
    case 'passed':
    case 'started':
      if (state === 'canceled' && !startedAt) {
        break;
      }

      buildTime.from = startedAt;
      break;

    case 'scheduled':
      buildTime.from = scheduledAt;
      break;
  }

  switch (state) {
    case 'blocked':
    case 'failed':
    case 'passed':
      buildTime.to = finishedAt;
      break;

    case 'canceled':
      if (!startedAt) {
        break;
      }

      buildTime.to = canceledAt;
      break;
  }

  return buildTime;
}

export function buildStatus(build) {
  const { state, createdAt, canceledAt, finishedAt } = build;

  if (state === 'failed' || state === 'passed') {
    return {
      prefix: 'Finished',
      timeValue: finishedAt
    };
  } else if (state === 'blocked') {
    return {
      prefix: 'Blocked',
      timeValue: finishedAt
    };
  } else if (state === 'canceled' || state === 'canceling') {
    return {
      prefix: 'Canceled',
      timeValue: canceledAt
    };
  } else if (state === 'skipped') {
    return {
      prefix: 'Skipped',
      timeValue: createdAt
    };
  }

  return {
    prefix: 'Created',
    timeValue: createdAt
  };
}