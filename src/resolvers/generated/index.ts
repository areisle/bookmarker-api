import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { RequestContext } from './utilities';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type RequireFields<T, K extends keyof T> = { [X in Exclude<keyof T, K>]?: T[X] } & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Date: any;
  JSON: any;
  Void: any;
};

export type Activity = {
  __typename?: 'Activity';
  createdAt: Scalars['Date'];
  createdBy: User;
  createdById: Scalars['Int'];
  drama?: Maybe<Drama>;
  dramaId?: Maybe<Scalars['Int']>;
  id: Scalars['Int'];
  message: Scalars['String'];
};

export type ActivityQueryResponse = {
  __typename?: 'ActivityQueryResponse';
  data: Array<Activity>;
  meta: PaginationInfo;
};

export type CreateDramaContent = {
  country?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  episodeCount?: Maybe<Scalars['Int']>;
  episodeDuration?: Maybe<Scalars['Int']>;
  finishedAiringAt?: Maybe<Scalars['Date']>;
  links?: Maybe<Array<Scalars['String']>>;
  startedAiringAt?: Maybe<Scalars['Date']>;
  status?: Maybe<Scalars['String']>;
  tags?: Maybe<Array<Scalars['String']>>;
  title?: Maybe<Scalars['String']>;
  watched?: Maybe<Scalars['String']>;
};

export type CreateUserInput = {
  admin?: Maybe<Scalars['Boolean']>;
  email: Scalars['String'];
};

export type Drama = {
  __typename?: 'Drama';
  country?: Maybe<Scalars['String']>;
  createdAt: Scalars['Date'];
  createdBy: User;
  createdById: Scalars['Int'];
  currentUserWatched?: Maybe<Scalars['String']>;
  description: Scalars['String'];
  episodeCount?: Maybe<Scalars['Int']>;
  episodeDuration?: Maybe<Scalars['Int']>;
  finishedAiringAt?: Maybe<Scalars['Date']>;
  groupedTags: Array<GroupedTag>;
  id: Scalars['Int'];
  lastModifiedAt: Scalars['Date'];
  lastModifiedBy: User;
  lastModifiedById: Scalars['Int'];
  links: Array<Link>;
  startedAiringAt?: Maybe<Scalars['Date']>;
  status: Scalars['String'];
  tags: Array<Tag>;
  title: Scalars['String'];
  watched: Array<Watched>;
};

export type DramasQueryResponse = {
  __typename?: 'DramasQueryResponse';
  data: Array<Drama>;
  meta: PaginationInfo;
};

export type GroupedTag = {
  __typename?: 'GroupedTag';
  count: Scalars['Int'];
  current: Scalars['Boolean'];
  name: Scalars['String'];
};

export type Link = {
  __typename?: 'Link';
  createdAt: Scalars['Date'];
  createdBy: User;
  createdById: Scalars['Int'];
  id: Scalars['Int'];
  title: Scalars['String'];
  url: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  addDrama?: Maybe<Drama>;
  addUser?: Maybe<User>;
  removeDrama?: Maybe<Scalars['Void']>;
  removeUser?: Maybe<Scalars['Void']>;
  updateDrama?: Maybe<Scalars['Void']>;
};


export type MutationAddDramaArgs = {
  input: CreateDramaContent;
};


export type MutationAddUserArgs = {
  email: Scalars['String'];
};


export type MutationRemoveDramaArgs = {
  id: Scalars['Int'];
};


export type MutationRemoveUserArgs = {
  email: Scalars['String'];
};


export type MutationUpdateDramaArgs = {
  id: Scalars['Int'];
  input: CreateDramaContent;
};

export type PaginationInfo = {
  __typename?: 'PaginationInfo';
  count: Scalars['Int'];
  skip?: Maybe<Scalars['Int']>;
  take?: Maybe<Scalars['Int']>;
  total: Scalars['Int'];
};

export type Query = {
  __typename?: 'Query';
  activity: ActivityQueryResponse;
  currentUser: User;
  drama?: Maybe<Drama>;
  dramas: DramasQueryResponse;
  dump?: Maybe<Scalars['JSON']>;
  isDramaBookmarked?: Maybe<Scalars['Int']>;
  tags: Array<Tag>;
  users: Array<User>;
};


export type QueryActivityArgs = {
  orderBy?: Maybe<Scalars['JSON']>;
  skip?: Maybe<Scalars['Int']>;
  take?: Maybe<Scalars['Int']>;
  where?: Maybe<Scalars['JSON']>;
};


export type QueryDramaArgs = {
  id: Scalars['Int'];
};


export type QueryDramasArgs = {
  orderBy?: Maybe<Scalars['JSON']>;
  skip?: Maybe<Scalars['Int']>;
  take?: Maybe<Scalars['Int']>;
  where?: Maybe<Scalars['JSON']>;
};


export type QueryIsDramaBookmarkedArgs = {
  url: Scalars['String'];
};


export type QueryTagsArgs = {
  skip?: Maybe<Scalars['Int']>;
  take?: Maybe<Scalars['Int']>;
  where?: Maybe<Scalars['JSON']>;
};

export type Tag = {
  __typename?: 'Tag';
  createdAt: Scalars['Date'];
  createdBy: User;
  createdByCurrentUser?: Maybe<Scalars['Boolean']>;
  createdById: Scalars['Int'];
  id: Scalars['Int'];
  name: Scalars['String'];
};

export type UpdateLinkContent = {
  url: Scalars['String'];
};

export type User = {
  __typename?: 'User';
  admin: Scalars['Boolean'];
  createdAt: Scalars['Date'];
  createdBy?: Maybe<User>;
  createdById?: Maybe<Scalars['Int']>;
  email: Scalars['String'];
  id: Scalars['Int'];
  modifiedAt: Scalars['Date'];
};

export type Watched = {
  __typename?: 'Watched';
  createdAt: Scalars['Date'];
  createdBy: User;
  createdById: Scalars['Int'];
  id: Scalars['Int'];
  lastModifiedAt: Scalars['Date'];
  status?: Maybe<Scalars['String']>;
};



export type ResolverTypeWrapper<T> = T extends Record<string, any> ? (Promise<Partial<T>> | Partial<T>) : T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterator<TResult> | Promise<AsyncIterator<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Activity: ResolverTypeWrapper<Activity>;
  ActivityQueryResponse: ResolverTypeWrapper<ActivityQueryResponse>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  CreateDramaContent: CreateDramaContent;
  CreateUserInput: CreateUserInput;
  Date: ResolverTypeWrapper<Scalars['Date']>;
  Drama: ResolverTypeWrapper<Drama>;
  DramasQueryResponse: ResolverTypeWrapper<DramasQueryResponse>;
  GroupedTag: ResolverTypeWrapper<GroupedTag>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  JSON: ResolverTypeWrapper<Scalars['JSON']>;
  Link: ResolverTypeWrapper<Link>;
  Mutation: ResolverTypeWrapper<{}>;
  PaginationInfo: ResolverTypeWrapper<PaginationInfo>;
  Query: ResolverTypeWrapper<{}>;
  String: ResolverTypeWrapper<Scalars['String']>;
  Tag: ResolverTypeWrapper<Tag>;
  UpdateLinkContent: UpdateLinkContent;
  User: ResolverTypeWrapper<User>;
  Void: ResolverTypeWrapper<Scalars['Void']>;
  Watched: ResolverTypeWrapper<Watched>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Activity: Activity;
  ActivityQueryResponse: ActivityQueryResponse;
  Boolean: Scalars['Boolean'];
  CreateDramaContent: CreateDramaContent;
  CreateUserInput: CreateUserInput;
  Date: Scalars['Date'];
  Drama: Drama;
  DramasQueryResponse: DramasQueryResponse;
  GroupedTag: GroupedTag;
  Int: Scalars['Int'];
  JSON: Scalars['JSON'];
  Link: Link;
  Mutation: {};
  PaginationInfo: PaginationInfo;
  Query: {};
  String: Scalars['String'];
  Tag: Tag;
  UpdateLinkContent: UpdateLinkContent;
  User: User;
  Void: Scalars['Void'];
  Watched: Watched;
};

export type ActivityResolvers<ContextType = RequestContext, ParentType extends ResolversParentTypes['Activity'] = ResolversParentTypes['Activity']> = {
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  createdBy?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  createdById?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  drama?: Resolver<Maybe<ResolversTypes['Drama']>, ParentType, ContextType>;
  dramaId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ActivityQueryResponseResolvers<ContextType = RequestContext, ParentType extends ResolversParentTypes['ActivityQueryResponse'] = ResolversParentTypes['ActivityQueryResponse']> = {
  data?: Resolver<Array<ResolversTypes['Activity']>, ParentType, ContextType>;
  meta?: Resolver<ResolversTypes['PaginationInfo'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface DateScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Date'], any> {
  name: 'Date';
}

export type DramaResolvers<ContextType = RequestContext, ParentType extends ResolversParentTypes['Drama'] = ResolversParentTypes['Drama']> = {
  country?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  createdBy?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  createdById?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  currentUserWatched?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  episodeCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  episodeDuration?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  finishedAiringAt?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  groupedTags?: Resolver<Array<ResolversTypes['GroupedTag']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  lastModifiedAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  lastModifiedBy?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  lastModifiedById?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  links?: Resolver<Array<ResolversTypes['Link']>, ParentType, ContextType>;
  startedAiringAt?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tags?: Resolver<Array<ResolversTypes['Tag']>, ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  watched?: Resolver<Array<ResolversTypes['Watched']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DramasQueryResponseResolvers<ContextType = RequestContext, ParentType extends ResolversParentTypes['DramasQueryResponse'] = ResolversParentTypes['DramasQueryResponse']> = {
  data?: Resolver<Array<ResolversTypes['Drama']>, ParentType, ContextType>;
  meta?: Resolver<ResolversTypes['PaginationInfo'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GroupedTagResolvers<ContextType = RequestContext, ParentType extends ResolversParentTypes['GroupedTag'] = ResolversParentTypes['GroupedTag']> = {
  count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  current?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface JsonScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['JSON'], any> {
  name: 'JSON';
}

export type LinkResolvers<ContextType = RequestContext, ParentType extends ResolversParentTypes['Link'] = ResolversParentTypes['Link']> = {
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  createdBy?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  createdById?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = RequestContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  addDrama?: Resolver<Maybe<ResolversTypes['Drama']>, ParentType, ContextType, RequireFields<MutationAddDramaArgs, 'input'>>;
  addUser?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationAddUserArgs, 'email'>>;
  removeDrama?: Resolver<Maybe<ResolversTypes['Void']>, ParentType, ContextType, RequireFields<MutationRemoveDramaArgs, 'id'>>;
  removeUser?: Resolver<Maybe<ResolversTypes['Void']>, ParentType, ContextType, RequireFields<MutationRemoveUserArgs, 'email'>>;
  updateDrama?: Resolver<Maybe<ResolversTypes['Void']>, ParentType, ContextType, RequireFields<MutationUpdateDramaArgs, 'id' | 'input'>>;
};

export type PaginationInfoResolvers<ContextType = RequestContext, ParentType extends ResolversParentTypes['PaginationInfo'] = ResolversParentTypes['PaginationInfo']> = {
  count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  skip?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  take?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = RequestContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  activity?: Resolver<ResolversTypes['ActivityQueryResponse'], ParentType, ContextType, RequireFields<QueryActivityArgs, never>>;
  currentUser?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  drama?: Resolver<Maybe<ResolversTypes['Drama']>, ParentType, ContextType, RequireFields<QueryDramaArgs, 'id'>>;
  dramas?: Resolver<ResolversTypes['DramasQueryResponse'], ParentType, ContextType, RequireFields<QueryDramasArgs, never>>;
  dump?: Resolver<Maybe<ResolversTypes['JSON']>, ParentType, ContextType>;
  isDramaBookmarked?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<QueryIsDramaBookmarkedArgs, 'url'>>;
  tags?: Resolver<Array<ResolversTypes['Tag']>, ParentType, ContextType, RequireFields<QueryTagsArgs, never>>;
  users?: Resolver<Array<ResolversTypes['User']>, ParentType, ContextType>;
};

export type TagResolvers<ContextType = RequestContext, ParentType extends ResolversParentTypes['Tag'] = ResolversParentTypes['Tag']> = {
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  createdBy?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  createdByCurrentUser?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  createdById?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserResolvers<ContextType = RequestContext, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  admin?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  createdById?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  modifiedAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface VoidScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Void'], any> {
  name: 'Void';
}

export type WatchedResolvers<ContextType = RequestContext, ParentType extends ResolversParentTypes['Watched'] = ResolversParentTypes['Watched']> = {
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  createdBy?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  createdById?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  lastModifiedAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  status?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = RequestContext> = {
  Activity?: ActivityResolvers<ContextType>;
  ActivityQueryResponse?: ActivityQueryResponseResolvers<ContextType>;
  Date?: GraphQLScalarType;
  Drama?: DramaResolvers<ContextType>;
  DramasQueryResponse?: DramasQueryResponseResolvers<ContextType>;
  GroupedTag?: GroupedTagResolvers<ContextType>;
  JSON?: GraphQLScalarType;
  Link?: LinkResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  PaginationInfo?: PaginationInfoResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Tag?: TagResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  Void?: GraphQLScalarType;
  Watched?: WatchedResolvers<ContextType>;
};

