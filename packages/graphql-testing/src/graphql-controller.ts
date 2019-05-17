import {ApolloLink, GraphQLRequest} from 'apollo-link';
import {
  ApolloReducerConfig,
  InMemoryCache,
  IntrospectionFragmentMatcher,
} from 'apollo-cache-inmemory';
import {ApolloClient} from 'apollo-client';

import {MockLink, InflightLink} from './links';
import {Operations} from './operations';
import {GraphQLMock, MockRequest} from './types';

export interface Options {
  unionOrIntersectionTypes?: any[];
  cacheOptions?: ApolloReducerConfig;
}

interface Wrapper {
  (perform: () => Promise<void>): Promise<void>;
}

export class GraphQL {
  readonly client: ApolloClient<unknown>;
  readonly operations = new Operations();

  private readonly pendingRequests = new Set<MockRequest>();
  private readonly wrappers: Wrapper[] = [];

  constructor(
    mock: GraphQLMock | undefined,
    {unionOrIntersectionTypes = [], cacheOptions = {}}: Options = {},
  ) {
    const cache = new InMemoryCache({
      fragmentMatcher: new IntrospectionFragmentMatcher({
        introspectionQueryResultData: {
          __schema: {
            types: unionOrIntersectionTypes,
          },
        },
      }),
      ...cacheOptions,
    });

    const link = ApolloLink.from([
      new InflightLink({
        onCreated: this.handleCreate,
        onResolved: this.handleResolve,
      }),
      new MockLink(mock || defaultGraphQLMock),
    ]);

    this.client = new ApolloClient({
      link,
      cache,
    });
  }

  async resolveAll() {
    await this.wrappers.reduce<() => Promise<void>>(
      (perform, wrapper) => {
        return () => wrapper(perform);
      },
      async () => {
        await Promise.all(
          Array.from(this.pendingRequests).map(({resolve}) => resolve()),
        );
      },
    )();
  }

  wrap(wrapper: Wrapper) {
    this.wrappers.push(wrapper);
  }

  private handleCreate = (request: MockRequest) => {
    this.pendingRequests.add(request);
  };

  private handleResolve = (request: MockRequest) => {
    this.operations.push(request.operation);
    this.pendingRequests.delete(request);
  };
}

function defaultGraphQLMock({operationName}: GraphQLRequest) {
  return new Error(
    `Can’t perform GraphQL operation '${operationName ||
      ''}' because no mocks were set.`,
  );
}