# Task Decomposition Prompt

Turn a classified user input case into an executable task flow.

Steps:

1. Start from the recommended composite task template when one exists.
2. Keep atomic tasks in a practical execution order.
3. Remove tasks that do not help the user's immediate goal.
4. For urgent requests, compress scope before teaching or practice.
5. For ambiguous requests, stop at the clarification task.

Return:

- selected template ID
- ordered atomic task IDs
- estimated total minutes
- output goal
- first feedback loop to show
