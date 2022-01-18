const createBenchmarks = (
  agentPolicies: GetAgentPoliciesResponseItem[],
  packagePolicies: PackagePolicy[]
): Benchmark[] => {
  return agentPolicies.flatMap((agentPolicy) => agentPolicy.package_policies);
};
const createBenchmarks = (
  agentPolicies: GetAgentPoliciesResponseItem[] | undefined,
  packagePolicies: PackagePolicy[]
): Benchmark[] => {
  const benchmarks: Benchmark[] = agentPolicies?.flatMap(
    (agentPolicy: GetAgentPoliciesResponseItem) => {
      const benchmark: Benchmark = agentPolicy.package_policies.map(
        (packagePolicyId: string | PackagePolicy) => {
          const packageDetails = packagePolicies.filter(
            (packagePolicy) => packagePolicy.id === packagePolicyId
          )[0];
          if (packageDetails) {
            return {
              package_policy: {
                id: packagePolicyId,
                name: packageDetails?.name,
                policy_id: packageDetails?.policy_id,
                namespace: packageDetails?.namespace,
                updated_at: packageDetails?.updated_at,
                updated_by: packageDetails?.updated_by,
                created_at: packageDetails?.created_at,
                created_by: packageDetails?.created_by,
                package: {
                  name: packageDetails.package?.name,
                  title: packageDetails.package?.title,
                  version: packageDetails.package?.version,
                },
              },
              agent_policy: {
                id: agentPolicy.id,
                name: agentPolicy.name,
                agents: agentPolicy.agents,
              },
            };
          }
        }
      );
      if (benchmark) {
        return benchmark;
      }
    }
  );
  return benchmarks;
};
